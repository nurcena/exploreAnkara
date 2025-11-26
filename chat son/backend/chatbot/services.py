import re
from flask import current_app
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.schema import SystemMessage
import uuid
import os
import sys
import datetime
import flask_login
from models.db import get_db_connection

class ChatbotService:
    """Service for handling chatbot interactions using LangChain and RAG."""
    
    def __init__(self):
        """Initialize the chatbot service with LangChain components."""
        self.conversations = {}
        
        # RAG sistemini başlat
        self.data_loader = None
        self._init_rag_system()
    
    def _init_rag_system(self):
        """RAG sistemini başlat ve veri dosyalarını yükle"""
        try:
            from rag.data_loader import AnkaraDataLoader
            
            api_key = os.getenv('OPENAI_API_KEY') or current_app.config['OPENAI_API_KEY']
            
            # Proje kök dizinini bul
            script_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.dirname(script_dir)
            data_dir = os.path.join(backend_dir, "data")
            
            print(f"[CHATBOT] RAG sistemi başlatılıyor...")
            print(f"[CHATBOT] Veri dizini: {data_dir}")
            
            # Dizinde md dosyaları var mı kontrol et
            if os.path.exists(data_dir):
                files = [f for f in os.listdir(data_dir) if f.endswith('.md')]
                print(f"[CHATBOT] Veri dizinindeki dosyalar: {files}")
            else:
                print(f"[CHATBOT] UYARI: {data_dir} dizini bulunamadı!")
                # Dizini oluştur
                os.makedirs(data_dir, exist_ok=True)
                print(f"[CHATBOT] {data_dir} dizini oluşturuldu.")
            
            # OpenAI Embeddings modülünü oluştur
            self.embeddings = OpenAIEmbeddings(api_key=api_key)
            print("[CHATBOT] OpenAI Embeddings modeli başarıyla yüklendi.")
            
            self.data_loader = AnkaraDataLoader(api_key=api_key, data_dir=data_dir)
            self.data_loader.load_and_index_all()
            print("[CHATBOT] RAG sistemi başarıyla başlatıldı.")
        except Exception as e:
            print(f"[CHATBOT] RAG sistemi başlatılırken hata oluştu: {str(e)}")
            print(f"[CHATBOT] Hata detayı: {sys.exc_info()}")
            # Hata olsa bile devam et, sadece RAG olmadan çalışacak
        
    def _get_llm(self):
        """Get the language model."""
        model_name = current_app.config.get('MODEL_NAME', 'gpt-4o')
        print(f"[CHATBOT] Model yükleniyor: {model_name}")
        
        return ChatOpenAI(
            api_key=current_app.config['OPENAI_API_KEY'],
            model_name=model_name,
            temperature=current_app.config['TEMPERATURE'],
            max_tokens=current_app.config['MAX_TOKENS']
        )
    
    def _get_conversation_chain(self, conversation_id=None):
        """
        Get or create a conversation chain for the given conversation ID.
        
        Args:
            conversation_id: Optional ID for the conversation
            
        Returns:
            LLMChain and the conversation_id
        """
        # Create a new conversation ID if none is provided
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
            print(f"[CHATBOT] Yeni konuşma ID oluşturuldu: {conversation_id}")
        
        # Create a new conversation chain if it doesn't exist
        if conversation_id not in self.conversations:
            print(f"[CHATBOT] {conversation_id} ID'li konuşma zinciri oluşturuluyor...")
            
            # Create a conversation memory
            memory = ConversationBufferMemory()
            
            # Güncel tarihi hazırla
            current_date = datetime.datetime.now().strftime("%d %B %Y")
            
            # Sistem mesajı oluştur
            system_template = f"""
    Sen Ankara şehri hakkında uzman bir gezi rehberisin. Kullanıcıların kişisel tercihlerine göre 
    özelleştirilmiş gezi rotaları hazırlıyorsun. Cevaplarında her zaman nazik, bilgilendirici 
    ve yardımcı olmaya çalış.
    
    Bugünün tarihi: {current_date}
    
    BİLGİ KAYNAKLARIN:
    - Ankara'daki popüler restoranlar
    - Ankara'daki parklar ve yeşil alanlar
    - Ankara'daki müzeler ve tarihi yerler
    - Ankara'daki alışveriş merkezleri
    - Ankara'daki güncel ve yaklaşan etkinlikler
    
    KULLANICI TERCİHLERİNİ DİKKATE ALARAK ROTA OLUŞTUR:
    - Bütçe: Kullanıcının belirttiği bütçeye göre mekanlar öner
    - Kiminle geziyor: Tek başına, aile, arkadaşlar veya sevgili ile gezilecek yerler öner
    - Kıyafet tercihi: Spor, şık veya günlük kıyafete uygun mekanlar öner
    - Ruh hali: Enerjik, yorgun veya sakin ruh haline uygun aktiviteler öner
    - Zaman: Kullanıcının belirttiği saat aralığına uygun bir rota planla
    - İlgi alanları: Yeme-içme, alışveriş, doğa, spor, tiyatro, sinema, konser, müze, komedi gibi tercihlere uygun yerler öner
    
    ROTA OLUŞTURMA KURALLARI:
    1. Veritabanımızdaki güncel bilgilere dayanarak cevap ver
    2. Kullanıcı tercihlerine uygun rotalar oluştur
    3. Rotaları zaman çizelgesi şeklinde düzenle (ör: 10:00 - X Müzesi, 12:30 - Y Restoranı...)
    4. Her mekân için kısa bir açıklama, adres ve varsa ücret bilgisi ekle
    5. Farklı aktivite türleri içeren dengeli rotalar oluştur
    6. Zamanı ve uzaklıkları dikkate alarak gerçekçi rotalar planla
    
    Eğer kullanıcının tercihi belirtilmemişse, genel öneriler sunarken esnek ol.
    Sorular sorarak kullanıcının tercihlerini öğrenmeye çalış.
    bİLMEDİĞİM ÖNERİ VERİRKEN FİYAT VS BİLGİN YOKSA EKLEME ONU Fiyat Seviyesİ GİBİ FİLAN BELİRTME SAKIN.
    MİNUMUM 5 DURAKLI BİR ROTA OLUSTURMAYA ÖZEN GÖSTERMELİSİN.
    ADRESLER VERİLERDE YOKSA KENDİN BUL YAZ ADRESLERİ
    FİYATLAR BELİRTLENMİŞSE SEN ORTALAMA FİYATLARI YAZ GENE TÜM BİLGİLERİ KULLANICI GÖRMELİ.
    …Cevaplarında kalın (**) veya italik (*) biçimlendirme kullanma, tamamen düz metin yaz..
    """

            
            # Prompt şablonu oluştur
            prompt_template = PromptTemplate(
                input_variables=["history", "input"],
                template="{history}\nİnsan: {input}\nAI Asistan:"
            )
            
            # LLMChain oluştur
            llm = self._get_llm()
            chain = LLMChain(
                llm=llm,
                prompt=prompt_template,
                verbose=True,
                memory=memory,
            )
            
            # İlk sistem mesajını belleğe ekle
            memory.chat_memory.add_message(SystemMessage(content=system_template))
            
            self.conversations[conversation_id] = chain
            print(f"[CHATBOT] {conversation_id} ID'li konuşma zinciri oluşturuldu")
        
        return self.conversations[conversation_id], conversation_id
    
    def process_message(self, message, conversation_id=None):
        """
        Process a user message and return the AI response.
        
        Args:
            message: The user's message
            conversation_id: Optional ID for the conversation
            
        Returns:
            AI response text
        """
        print(f"[CHATBOT] İşlenen mesaj: {message}")
        
        # Get or create the conversation chain
        chain, conversation_id = self._get_conversation_chain(conversation_id)
        
        # Kullanıcı tercihlerini al
        user_preferences = self._get_user_preferences()
        
        # Eğer RAG etkinse ve yüklendiyse, sorgu yap
        rag_context = ""
        retrieved_data = None
        
        if self.data_loader:
            try:
                print("[CHATBOT] RAG araması yapılıyor...")
                # Her kategoriden en az 2 sonuç al
                search_results = self.data_loader.search(message, k=200)
                
                if search_results:
                    retrieved_data = {}
                    rag_context = "\n\n### VERİTABANI SONUÇLARI ###\n\n"
                    
                    for category, results in search_results.items():
                        if results:
                            retrieved_data[category] = [doc.page_content for doc in results[:2]]
                            rag_context += f"--- {category.upper()} BİLGİLERİ ---\n"
                            for i, doc in enumerate(results[:2], 1):
                                rag_context += f"{i}. {doc.page_content}\n\n"
                    
                    print(f"[CHATBOT] RAG sonuçları bulundu: {len(search_results)} kategoride")
                else:
                    print("[CHATBOT] RAG aramasında hiç sonuç bulunamadı.")
            except Exception as e:
                print(f"[CHATBOT] RAG araması sırasında hata: {str(e)}")
        else:
            print("[CHATBOT] RAG sistemi aktif değil, normal modda yanıt veriliyor.")
        
        try:
            # Kullanıcı tercihleri varsa eklenti hazırla
            preferences_context = ""
            if user_preferences:
                preferences_context = "\n\n### KULLANICI TERCİHLERİ ###\n"
                
                if user_preferences.get('budget'):
                    budget_map = {
                        'low': 'Düşük (0-500₺)',
                        'medium': 'Orta (500-2000₺)',
                        'high': 'Yüksek (2000₺+)'
                    }
                    preferences_context += f"Bütçe: {budget_map.get(user_preferences['budget'], user_preferences['budget'])}\n"
                
                if user_preferences.get('company'):
                    company_map = {
                        'alone': 'Yalnız',
                        'family': 'Aile',
                        'friends': 'Arkadaşlar',
                        'partner': 'Sevgili'
                    }
                    preferences_context += f"Refakatçi: {company_map.get(user_preferences['company'], user_preferences['company'])}\n"
                
                if user_preferences.get('dress'):
                    dress_map = {
                        'casual': 'Günlük',
                        'sport': 'Spor',
                        'elegant': 'Şık'
                    }
                    preferences_context += f"Kıyafet Tercihi: {dress_map.get(user_preferences['dress'], user_preferences['dress'])}\n"
                
                if user_preferences.get('mood'):
                    mood_map = {
                        'energetic': 'Enerjik',
                        'tired': 'Yorgun',
                        'calm': 'Sakin'
                    }
                    preferences_context += f"Ruh Hali: {mood_map.get(user_preferences['mood'], user_preferences['mood'])}\n"
                
                if user_preferences.get('time'):
                    preferences_context += f"Zaman: {user_preferences['time']} Saat\n"
                
                if user_preferences.get('interests') and len(user_preferences['interests']) > 0:
                    interest_map = {
                        'food': 'Yeme & İçme',
                        'shopping': 'Alışveriş',
                        'nature': 'Doğa',
                        'sports': 'Spor',
                        'theater': 'Tiyatro',
                        'cinema': 'Sinema',
                        'concert': 'Konser',
                        'museum': 'Müze',
                        'comedy': 'Komedi'
                    }
                    interests_str = ', '.join([interest_map.get(i, i) for i in user_preferences['interests']])
                    preferences_context += f"İlgi Alanları: {interests_str}\n"
            preferences_context += "\nYukarıdaki bilgilere dayanarak, kullanıcı için ideal bir Ankara gezi rotası oluştur. Rota, saat-aktivite şeklinde düzenlenmeli ve kullanıcının tercihlerine uygun mekanlar içermelidir."
            
            # İki farklı strateji uygula: RAG verileriyle zenginleştirilmiş ve RAG olmadan
            if rag_context or preferences_context:
                print("[CHATBOT] Zenginleştirilmiş yanıt oluşturuluyor...")
                # Tüm bağlamı birleştir
                context = ""
                if rag_context:
                    context += rag_context
                if preferences_context:
                    context += preferences_context
                
                # RAG bağlamını mesaja ekle
                enhanced_message = f"{message}\n\n{context}"
                
                # Process the message through the chain
                response = chain.predict(input=enhanced_message)
            else:
                print("[CHATBOT] Normal yanıt oluşturuluyor (RAG verisi yok)...")
                # Normal mesajı işle
                response = chain.predict(input=message)
            
            print(f"[CHATBOT] Yanıt oluşturuldu (uzunluk: {len(response)})")
            clean_response = re.sub(r'\*{1,2}([^\*]+?)\*{1,2}', r'\1', response)
            clean_response = re.sub(r'\n+', '\n', clean_response).strip()
            response = clean_response
            return response
            
        except Exception as e:
            print(f"[CHATBOT] Yanıt oluşturulurken hata: {str(e)}")
            return "Üzgünüm, yanıtınızı oluştururken bir hata oluştu. Lütfen tekrar deneyin."
    
    def _get_user_preferences(self):
        """Kullanıcı tercihlerini veritabanından al."""
        try:
            user_id = flask_login.current_user.id
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT Budget, Company, Dress, Mood, TimePreference, Interests FROM UserPreferences WHERE UserID = ?",
                (user_id,)
            )
            
            preferences = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if preferences:
                # Convert interests string to list
                interests = preferences.Interests.split(',') if preferences.Interests else []
                
                return {
                    'budget': preferences.Budget,
                    'company': preferences.Company,
                    'dress': preferences.Dress,
                    'mood': preferences.Mood,
                    'time': preferences.TimePreference,
                    'interests': interests
                }
            
            return None
        except Exception as e:
            print(f"[CHATBOT] Kullanıcı tercihleri alınırken hata: {str(e)}")
            return None