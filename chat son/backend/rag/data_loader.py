import os
import re
from typing import Dict, List, Any, Optional
import markdown
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.docstore.document import Document


class AnkaraDataLoader:
    """Markdown dosyalarındaki Ankara verilerini yükleyip FAISS ile indeksler
    ve kullanıcı sorguları için basit bir vektör araması sunar.

    Dosya biçimi örneği (restaurants.md):
    ## Müjgân 100.Yıl
    - **place_id:** ChIJ...
    - **address:** 100. Yıl ...
    - **rating:** 4.3
    - **price_level:** 2
    - **district:** Çankaya
    - **lat:** 39.89...
    - **lng:** 32.79...
    """

    # ------------------------------------------------------------------
    # KATEGORİ / DOSYA HARİTASI
    # ------------------------------------------------------------------
    FILE_MAP: Dict[str, str] = {
        "restaurants": "restaurants.md",
        "parks": "parks_data.md",
        "museums": "museums_data.md",
        "malls": "malls_data.md",
        "events": "etkinlikler.md",
    }

    # Her kategoriye özel metaveri düzeni (adres, koordinat anahtarları vb.)
    CATEGORY_META: Dict[str, Dict[str, Any]] = {
        "restaurants": {"doc_category": "restaurant", "loc_keys": ("lat", "lng")},
        "parks": {"doc_category": "park", "loc_keys": ("latitude", "longitude")},
        "museums": {"doc_category": "museum", "loc_keys": ("latitude", "longitude")},
        "malls": {"doc_category": "mall", "loc_keys": ("latitude", "longitude")},
        "events": {"doc_category": "event", "loc_keys": ("latitude", "longitude")},
    }

    # -------------------------------------------------------------- INIT
    def __init__(self, api_key: str, data_dir: str = "data") -> None:
        self.data_dir = data_dir
        self.embeddings = OpenAIEmbeddings(
            api_key=api_key,
            model="text-embedding-ada-002",
            show_progress_bar=True,
        )
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        # Her kategori için ayrı FAISS store saklıyoruz
        self.vectorstores: Dict[str, FAISS] = {}

    # ------------------------------------------------- PUBLIC HELPERS ---
    def load_and_index_all(self) -> None:
        """Tüm markdown dosyalarını tarar ve FAISS indekslerini oluşturur."""
        for cat, fname in self.FILE_MAP.items():
            self._load_single(cat, os.path.join(self.data_dir, fname))

    def get_all_docs(self, category: Optional[str] = None) -> List[Document]:
        """Belirli kategori (veya hepsi) için ham Document listesi döndürür."""
        if category:
            store = self.vectorstores.get(category)
            return list(store.docstore._dict.values()) if store else []
        docs: List[Document] = []
        for store in self.vectorstores.values():
            docs.extend(store.docstore._dict.values())
        return docs

    def get_prompt_context(self, max_per_category: int = 5) -> str:
        """Kısa bir veri dökümü üretip LLM prompt'una eklemeye yarar."""
        lines: List[str] = ["### VERİ TABANI DUMP ###"]
        for cat, store in self.vectorstores.items():
            docs = list(store.docstore._dict.values())[:max_per_category]
            if not docs:
                continue
            lines.append(f"--- {cat.upper()} ---")
            lines.extend(d.page_content.strip() for d in docs)
            lines.append("")
        return "\n".join(lines)

    # ---------------------------------------------------- SEARCH METHOD -
    def search(
        self,
        query: str,
        k: int = 2,
        categories: Optional[List[str]] = None,
    ) -> Dict[str, List[Document]]:
        """Veri tabanında basit benzerlik araması yapar.

        Parameters
        ----------
        query : str
            Kullanıcı sorgusu / metni.
        k : int, defaults to 2
            Her kategori için döndürülecek maksimum sonuç sayısı.
        categories : list[str] | None
            Sadece belirli kategorilerde arama yapmak istersen liste ver.

        Returns
        -------
        Dict[str, List[Document]]
            {"restaurants": [Document, ...], "parks": [...], ...}
        """
        results: Dict[str, List[Document]] = {}
        target_cats = categories or list(self.vectorstores.keys())

        for cat in target_cats:
            store = self.vectorstores.get(cat)
            if store is None:
                results[cat] = []
                continue
            try:
                results[cat] = store.similarity_search(query, k=k)
            except Exception as exc:
                print(f"[RAG] {cat} arama hatası: {exc}")
                results[cat] = []
        return results

    # -------------------------------------------------- INTERNAL LOADERS
    def _load_single(self, category: str, filepath: str) -> None:
        if not os.path.exists(filepath):
            print(f"[RAG] Uyarı: {filepath} bulunamadı!")
            return

        with open(filepath, "r", encoding="utf-8") as f:
            raw_text = f.read()
        print(f"[RAG] {category} ({len(raw_text)} karakter) okunuyor …")

        items = self._split_items(raw_text)
        docs: List[Document] = [self._make_document(category, name, meta) for name, meta in items]
        print(f"[RAG] {category}: {len(docs)} belge hazırlandı")

        if not docs:
            return

        # FAISS vektör deposunu oluştur
        self.vectorstores[category] = FAISS.from_documents(docs, self.embeddings)
        print(f"[RAG] {category}: FAISS indeks tamam ✓")

    # -------------------------------------------- PARSING HELPERS -------
    ITEM_HEADER_RE = re.compile(r"^## +(.+)$", re.MULTILINE)
    KV_RE = re.compile(r"^[\-* ]*\*?\*?([^:*\n]+)\*?\*?[:：]\s*(.+)$")

    def _split_items(self, markdown_text: str) -> List[tuple[str, Dict[str, str]]]:
        """Markdown'ı başlıklara bölüp key/value sözlükleri çıkarır."""
        items: List[tuple[str, Dict[str, str]]] = []
        matches = list(self.ITEM_HEADER_RE.finditer(markdown_text))
        for idx, m in enumerate(matches):
            name = m.group(1).strip()
            start = m.end()
            end = matches[idx + 1].start() if idx + 1 < len(matches) else len(markdown_text)
            body = markdown_text[start:end]
            meta: Dict[str, str] = {}
            for line in body.splitlines():
                line = line.strip()
                if not line:
                    continue
                line_clean = re.sub(r"\*", "", line)
                kv_match = self.KV_RE.match(line_clean)
                if kv_match:
                    key = kv_match.group(1).strip().lower().replace(" ", "_")
                    value = kv_match.group(2).strip()
                    meta[key] = value
            items.append((name, meta))
        return items

    def _make_document(self, category: str, name: str, meta: Dict[str, str]) -> Document:
        """Tek bir Document (LLM chunk'ı) üretir."""
        meta_spec = self.CATEGORY_META[category]
        doc_cat = meta_spec["doc_category"]
        lat_key, lng_key = meta_spec["loc_keys"]
        location = {"lat": meta.get(lat_key, ""), "lng": meta.get(lng_key, "")}

        content_parts = [f"Ankara'da {name} adlı {doc_cat} hakkında bilgi:"]
        for k, v in meta.items():
            if v:
                content_parts.append(f"{k.capitalize().replace('_', ' ')}: {v}")
        content = "\n".join(content_parts)

        return Document(
            page_content=content,
            metadata={"name": name, "category": doc_cat, "location": location},
        )
