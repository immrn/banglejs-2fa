# TODO für bangle2js

## Implementierung
- Woher wissen Dienst und Smartphone normalerweise wie das TOTP erstellt wird (welcher Hash-Alg.)?

- Hash Alg. verwenden um TOTP auf Uhr zu erstellen
- BLE Verbindung zwi. Browser Plugin und SW schaffen, Datenübertragung realisieren
- bei Setup der 2FA kann der Nutzer den geheimen Seed kopieren und in Plug-in eingeben, das Plug-in sendet den Seed an die SW zusammen mit URL und Username

- TOTP nutzt HMAC mit SHA1 alternativ auch mit SHA256 oder SHA512, siehe https://www.rfc-editor.org/rfc/rfc6238 S.3 Kapitel 1.2. letzter Absatz

### Wie required man ein eigenes js file
- guck dir einfach die datei sha1.min.js an, man beachte den anfang exports.ATTRIBUTE
- in WEB IDE Storage button (4 discs), dann das minifizierte js file hochladen

### 2FA Anfrage des TOTP des Browser an SW
- Browser-Plugin bietet Button an, bei dessen "Push" URL, Username und Uhrzeit (damit SW-Uhr synchron zu Browser/Dienst-Uhr, theoretisch nur bei Bangle notwendig, oder?) an SW übertragen wird
- Variante A:
    - SW schickt TOTP zurürck an Plugin und dieses setzt das TOTP automatisch ein
- Variante B: (als Backup, falls man das Plugin mal nicht verwenden kann)
    - SW zeigt TOTP an
### Weitere Aspekte
- Müssen unabh. von einer sichere BT-Verbindung Sicherheitsabfragen getätigt werden?

### Zusätzliche Implementierungen
- sichere BT-Verbindung

## Usertests
### Vergleich mit TOTP-App auf Handy (ohne Browser Plugin)
- Handy auf Tisch oder Handy in Hosentasche -> kostet beides Zeit, bei Vergleich mit nutzen
- TOTP aus Smartphone-App abtippen: Nutzer könnte TOTP falsch oder zu langsam abtippen
- analog für SW untersuchen

### Metriken
- Zeit messen (viellecht in Etappen unterteilt) von Aufforderung zur Eingabe des TOTP bis absenden des TOTP

## Schriftliche Ausarbeitung
Buch: How to Design and Report Experiments
