// Basit SpeechRecognition test
document.addEventListener('DOMContentLoaded', function() {
    const voiceButton = document.getElementById('voice-button');
    const userInput = document.getElementById('user-input');
    const messageForm = document.getElementById('message-form');
    
    if (!voiceButton) {
        console.error('Ses butonu bulunamadı!');
        return;
    }
    
    // Speech Recognition API desteğini kontrol et
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.error('Bu tarayıcı Speech Recognition API desteklemiyor!');
        voiceButton.style.display = 'none';
        return;
    }
    
    // Speech Recognition nesnesini oluştur
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Sonuç olayı
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        console.log('Tanınan konuşma:', transcript);
        userInput.value = transcript;
        
        // Otomatik gönder
        setTimeout(function() {
            messageForm.dispatchEvent(new Event('submit'));
        }, 500);
    };
    
    // Hata olayı
    recognition.onerror = function(event) {
        console.error('Ses tanıma hatası:', event.error);
        voiceButton.classList.remove('listening');
        voiceButton.querySelector('i').className = 'fas fa-microphone';
        
        alert('Ses tanıma hatası: ' + event.error);
    };
    
    // Bitiş olayı
    recognition.onend = function() {
        console.log('Ses tanıma bitti');
        voiceButton.classList.remove('listening');
        voiceButton.querySelector('i').className = 'fas fa-microphone';
    };
    
    // Tıklama işleyicisi
    voiceButton.addEventListener('click', function() {
        console.log('Ses butonuna tıklandı!');
        
        if (voiceButton.classList.contains('listening')) {
            // Durdur
            recognition.stop();
            voiceButton.classList.remove('listening');
            voiceButton.querySelector('i').className = 'fas fa-microphone';
        } else {
            // Başlat
            try {
                recognition.start();
                voiceButton.classList.add('listening');
                voiceButton.querySelector('i').className = 'fas fa-microphone-slash';
                console.log('Ses tanıma başlatıldı');
            } catch (err) {
                console.error('Ses tanıma başlatılamadı:', err);
                alert('Ses tanıma başlatılamadı: ' + err.message);
            }
        }
    });
});