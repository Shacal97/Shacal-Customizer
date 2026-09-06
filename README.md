# Shacal — Panel dodatków v6.3.7

## Nowość: Energia

W Notyficatorze wybierz styl obramowania **Energia** i zapisz ustawienia dodatku. Efekt otacza okno łupu i obszar gry. Korzysta z dotychczasowych kolorów, szerokości, krycia, poświaty, tempa i wyboru efektu. Aby uzyskać jeden lub dwa kolory, ustaw poświatę pozostałych kanałów na 0. Dla turkusowo-purpurowej ramki wybierz kolory `#13f6da` i `#d431ff`, a trzeci kanał wyłącz.

Tempo 0 zatrzymuje ruch Energii. Przy tempie większym od 0 ramka porusza się także z efektem „Brak” i przy systemowym ograniczeniu animacji. Dodatkowe efekty sterują pulsowaniem, migotaniem i kolorami. Rysowanie korzysta z osobnego zegara, niezależnego od requestAnimationFrame gry. Potwierdzenie TESTU natychmiast usuwa jego ramkę. Zamknięcie łupu usuwa efekt; na ukrytej karcie rysowanie jest wstrzymane. Nie ma dodatkowych ramek wokół pojedynczych przedmiotów w tym stylu.

Mały instalator Tampermonkey pobiera panel i pięć osobnych, wykonywalnych skryptów. Nie pobiera fragmentów tekstu do sklejenia w jeden skrypt i nie używa eval do uruchamiania dodatków.

## Pliki

- `install.user.js`: instalator, około 1,7 KB.
- `bootstrap.js`: pobieranie, kontrola kompletności i uruchamianie.
- `manifest.json`: wersja oraz lista plików i kolejność inicjalizacji.
- `panel.js`: wspólny panel, ustawienia, obsługa zdarzeń i infrastruktura.
- `addons/glow.js`: poświata i dźwięki.
- `addons/ramki-dymki.js`: ramki, dymki i znaczniki ulepszeń.
- `addons/czat.js`: ogłoszenia legend, emotikony oraz transport wiadomości współdzielony z wołaczem.
- `addons/wolacz.js`: powiadomienia o potworach.
- `addons/przelogowanie.js`: liczniki E2 i podświetlenie postaci.
- `assets/`: 30 plików MP3 i 10 grafik PNG.

Skrypty rejestrują funkcje oraz inicjalizację w `ShacalRuntime`. Funkcje współpracują przez wspólny kontekst `ctx`, zamiast polegać na zmiennych z jednego sklejonego pliku. Cały zestaw kodu pobierany jest przy uruchomieniu, ponieważ dodatki współdzielą infrastrukturę. Przełączniki decydują o działaniu funkcji; nie oznaczają usunięcia ich kodu z pamięci. Wspólne obserwatory nadal pracują. Nagrania są pobierane przez przeglądarkę przy użyciu, a nie jako Base64 w instalatorze.

## Wgranie do repozytorium

1. Rozpakuj paczkę ZIP na komputerze.
2. Otwórz repozytorium `Shacal97/Shacal-Customizer` i zakładkę Code.
3. Wybierz Add file → Upload files.
4. Przeciągnij **zawartość** rozpakowanego folderu, razem z katalogami `addons` i `assets`. Nie wgrywaj samego ZIP-a ani nadrzędnego folderu `Shacal_Repo_v6.3.7`.
5. Zapisz pliki przez Commit changes. Jeśli istnieją pliki o tych samych nazwach, sprawdź zmianę przed zatwierdzeniem. Stary `Shacal_Customizer.user.js` nie musi być usuwany.
6. W Settings → Pages wybierz Source: Deploy from a branch, Branch: main, folder: /(root), następnie Save. Jeśli repozytorium używa innej gałęzi, wybierz tę, do której wgrałeś pliki.
7. Poczekaj na zakończenie publikacji Pages. Najpierw sprawdź adres manifestu, potem instalatora.

Konfiguracja publikacji: [oficjalna dokumentacja GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Adresy po publikacji:

- `https://shacal97.github.io/Shacal-Customizer/manifest.json`
- `https://shacal97.github.io/Shacal-Customizer/install.user.js`

Te adresy są już wpisane w kodzie. Zmiana nazwy repozytorium lub domeny wymaga ich aktualizacji.

## Pierwsze uruchomienie

Wyłącz poprzedni duży skrypt Shacal w Tampermonkey. Następnie zainstaluj `install.user.js` z opublikowanego adresu i odśwież grę. Nowy panel korzysta z dotychczasowego klucza ustawień. Nie uruchamiaj obu wersji jednocześnie, ponieważ obie modyfikowałyby te same elementy gry.

Instalator ograniczono do `https://solphyr.margonem.pl/*`, bez ramek iframe. Nie uruchamia panelu na stronie głównej, forum ani innych światach.

Jeśli jednego skryptu zabraknie, zestaw nie jest inicjalizowany; pojawia się komunikat o błędzie. Po naprawieniu publikacji odśwież grę. Nie ma trybu offline ani automatycznego powrotu do starej wersji. Przy aktualizacji publikuj zgodny zestaw manifestu, bootstrapu, panelu, dodatków i instalatora.

## Testy

Sprawdzono lokalne pobieranie przez przeglądarkę z symulowanymi odpowiedziami HTTP i danymi silnika gry. Nie jest to jeszcze test opublikowanego GitHub Pages ani rzeczywistej sesji gry z Tampermonkey. Po publikacji należy sprawdzić ładowanie plików, TEST legendy, dźwięk i E2 w grze.

## Nowości v6.3.7

Własne logo Shacal Customizer, usunięta górna lista dodatków, nawigacja przez kafelki i przycisk powrotu. Każdy kafelek ma oddzielny zapis oraz znacznik niezapisanych zmian. Przyciski zapisu są też wewnątrz ustawień. Zapis jednego dodatku nie zapisuje szkiców pozostałych. Ramki i dymki mają wspólny zapis. Przezroczystość jest preferencją panelu i zapisuje się oddzielnie po zakończeniu zmiany suwaka.

Po wgraniu całej zawartości tej wersji i zakończeniu publikacji Pages zaktualizuj instalator z tego samego adresu install.user.js do v6.3.7. Nie trzeba zmieniać adresów.

29 testów lokalnych przeszło: izolacja zapisu, obsługa błędu zapisu, panel mobilny, E2, warstwy ulepszeń i awarie pobierania. Nie wykonano testu nowego panelu w rzeczywistej sesji gry.

## Poprawka v6.3.7

Przy korekcie czasów wybranej E2 dopasowanie jest przywracane po jej identyfikatorze. Kolejna E2 nie przejmuje podświetlenia, gdy wybrana znika. Zapis pozostaje zgodny z poprzednimi wersjami. Przeszło 17 testów E2, w tym korekta czasów, odczyt po przeładowaniu i zachowanie pierwszeństwa. Screen użytkownika potwierdza brak wybranego licznika, lecz bez danych historii nie rozstrzyga przyczyny konkretnego incydentu. Jeśli nadal nie ma kropki, potrzebny jest odczyt zapisanej historii; wiele liczników przy pierwszym uruchomieniu nadal nie pozwala odtworzyć kolejności zabójstw.
