const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Trefle API Ayarları
// NOT: trefle.io'dan aldığın token'ı tırnak içine yazmayı unutma!
const TREFLE_API_KEY = process.env.TREFLE_API_KEY || "usr-nLO7adRqdybvejyigBtUucDyw_EZlZ1WUidbko489Sk";
const TREFLE_BASE_URL = "https://trefle.io/api/v1/plants";

// API Endpoint'i HER ZAMAN statik dosyalardan yukarıda olmalı
app.post('/get-plants', async (req, res) => {
    console.log("--- 🌿 Trefle API İsteği Sunucuya Ulaştı ---");
    
    try {
        const { filterType, filterValue } = req.body;

        if (!filterType || !filterValue) {
            console.log("Hata: Frontend eksik veri gönderdi.");
            return res.status(400).json({ error: "Filtre parametreleri eksik!" });
        }

        // Trefle'a istek atacağımız URL'yi hazırlıyoruz
        const url = `${TREFLE_BASE_URL}?token=${TREFLE_API_KEY}&filter[${filterType}]=${filterValue}`;
        console.log("Trefle API'ye gidiliyor:", url);

        const response = await fetch(url);
        console.log("Trefle API Yanıt Durumu (Status):", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.log("Trefle API'den Dönen Hata Mesajı:", errorText);
            return res.status(response.status).json({ error: `Trefle Hatası: ${response.statusText}` });
        }

        const data = await response.json();
        console.log(`Başarılı! ${data.data ? data.data.length : 0} adet çiçek bulundu.`);
        
        // Veriyi frontend'e JSON formatında gönderiyoruz
        return res.json({ flowers: data.data || [] });

    } catch (error) {
        console.error("SUNUCU İÇ HATASI (CATCH):", error.message);
        return res.status(500).json({ error: error.message });
    }
});

// Statik klasör ve anasayfa yönlendirmesi en altta kalmalı
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Sunucu Hazır: http://localhost:${PORT}`);
    console.log("🌿 Trefle Köprüsü Aktif.");
});