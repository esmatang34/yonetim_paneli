# Yönetim Paneli

PostgreSQL ve MSSQL veritabanlarıyla çalışan, analiz ve raporlama katmanında Metabase kullanılan, arka planda n8n ile süreçlerin otomatikleştirildiği yönetim paneli altyapısı. Tüm servisler Docker ile çalışır.

## Yapı

| Klasör | Servis | Port |
|--------|--------|------|
| `postgres/` | PostgreSQL 16 | 5432 |
| `mssql/` | SQL Server 2022 (Developer) | 1433 |
| `metabase/` | Metabase + kendi PostgreSQL'i | 3000 |
| `n8n/` | n8n ve yardımcı betikler | 5678 |

## Kurulum

Her klasörde `.env.example` dosyasını `.env` olarak kopyalayıp şifreleri değiştirin:

```bash
cp postgres/.env.example postgres/.env
cp mssql/.env.example mssql/.env
cp metabase/.env.example metabase/.env
```

Sonra istediğiniz servisi başlatın:

```bash
cd postgres && docker compose up -d
```

n8n, `n8n_data` adlı hazır bir Docker volume'u bekler. Yoksa önce `docker volume create n8n_data` çalıştırın.

> `.env` dosyaları ve `mssql/backup` içeriği `.gitignore` ile repo dışında tutulur.
