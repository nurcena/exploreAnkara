import os

def write_tree_structure(root_dir, out):
    out.write("📁 Proje Ağaç Yapısı:\n")
    out.write("======================\n")
    for dirpath, dirnames, filenames in os.walk(root_dir):
        level = dirpath.replace(root_dir, "").count(os.sep)
        indent = "│   " * level
        folder_name = os.path.basename(dirpath)
        out.write(f"{indent}├── {folder_name}/\n")
        for fname in filenames:
            file_indent = "│   " * (level + 1)
            out.write(f"{file_indent}├── {fname}\n")
    out.write("\n\n")

def write_file_contents(root_dir, out, exclude_prefixes=[]):
    out.write("📄 Dosya İçerikleri:\n")
    out.write("======================\n")
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for fname in filenames:
            file_path = os.path.join(dirpath, fname)
            relative_path = os.path.relpath(file_path, root_dir)
            # Eğer dosya, dışlanacak dizinlerden birinin altındaysa atla
            if any(relative_path.replace("\\", "/").startswith(prefix) for prefix in exclude_prefixes):
                continue
            out.write(f"\n🗂 Dosya: {relative_path}\n")
            out.write(f"{'-' * (len(relative_path) + 10)}\n")
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                    if not lines:
                        out.write("  (boş dosya)\n")
                    for line in lines:
                        out.write(f"{line.rstrip()}\n")
            except Exception as e:
                out.write(f"[!] Dosya okunamadı: {e}\n")

def write_tree_with_contents_separated(root_dir, output_file):
    with open(output_file, "w", encoding="utf-8") as out:
        write_tree_structure(root_dir, out)
        # "backend/data" dizini altındaki dosyaların içeriğini yazma
        exclude_prefixes = ["backend/data"]
        write_file_contents(root_dir, out, exclude_prefixes=exclude_prefixes)

# Kullanım
if __name__ == "__main__":
    root_dir = "C:/Users/Kotil/Desktop/chat son"  # Proje kök dizinini buraya yaz
    output_file = "proje_agaci_ve_icerikler.txt"
    write_tree_with_contents_separated(root_dir, output_file)
    print(f"\nProje ağaç yapısı ve içerikler '{output_file}' dosyasına yazıldı.")
