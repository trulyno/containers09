# Darea de Seamă 
**Laborator 9: Optimizarea imaginilor**

---

## Scopul lucrării
Scopul lucrării este de a se familiariza cu metodele de optimizare a imaginilor Docker.

## Sarcina
Compararea diferitelor metode de optimizare a imaginilor:
- Ștergerea fișierelor temporare și a dependențelor neutilizate
- Reducerea numărului de straturi
- Utilizarea unei imagini de bază minime
- Reambalarea imaginii
- Utilizarea tuturor metodelor

## Descrierea executării lucrării

### Pregătire

1. Am creat un repositoriu `containers09` și am pregătit structura de fișiere necesară:
   ```
   containers09/
   ├── site/
   │   └── (fișiere site)
   ├── Dockerfile.raw
   └── alte fișiere Dockerfile
   ```

2. Am creat fișierul `Dockerfile.raw` pentru imaginea inițială:
   ```dockerfile
   # create from ubuntu image
   FROM ubuntu:latest

   # update system
   RUN apt-get update && apt-get upgrade -y

   # install nginx
   RUN apt-get install -y nginx

   # copy site
   COPY site /var/www/html

   # expose port 80
   EXPOSE 80

   # run nginx
   CMD ["nginx", "-g", "daemon off;"]
   ```

3. Am construit imaginea inițială:
   ```bash
   docker image build -t mynginx:raw -f Dockerfile.raw .
   ```

### Metoda 1: Eliminarea dependențelor neutilizate și a fișierelor temporare

1. Am creat fișierul `Dockerfile.clean`:
   ```dockerfile
   # create from ubuntu image
   FROM ubuntu:latest

   # update system
   RUN apt-get update && apt-get upgrade -y

   # install nginx
   RUN apt-get install -y nginx

   # remove apt cache
   RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

   # copy site
   COPY site /var/www/html

   # expose port 80
   EXPOSE 80

   # run nginx
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. Am construit imaginea optimizată:
   ```bash
   docker image build -t mynginx:clean -f Dockerfile.clean .
   ```

### Metoda 2: Minimizarea numărului de straturi

1. Am creat fișierul `Dockerfile.few`:
   ```dockerfile
   # create from ubuntu image
   FROM ubuntu:latest

   # update system
   RUN apt-get update && apt-get upgrade -y && \
       apt-get install -y nginx && \
       apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

   # copy site
   COPY site /var/www/html

   # expose port 80
   EXPOSE 80

   # run nginx
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. Am construit imaginea optimizată:
   ```bash
   docker image build -t mynginx:few -f Dockerfile.few .
   ```

### Metoda 3: Utilizarea unei imagini de bază minime

1. Am creat fișierul `Dockerfile.alpine`:
   ```dockerfile
   # create from alpine image
   FROM alpine:latest

   # update system
   RUN apk update && apk upgrade

   # install nginx
   RUN apk add nginx

   # copy site
   COPY site /var/www/html

   # expose port 80
   EXPOSE 80

   # run nginx
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. Am construit imaginea optimizată:
   ```bash
   docker image build -t mynginx:alpine -f Dockerfile.alpine .
   ```

### Metoda 4: Repachetarea imaginii

1. Am repackat imaginea inițială:
   ```bash
   docker container create --name mynginx mynginx:raw
   docker container export mynginx -o repack.tar
   docker image import repack.tar mynginx:repack
   docker container rm mynginx
   rm repack.tar
   ```

### Metoda 5: Utilizarea tuturor metodelor

1. Am creat fișierul `Dockerfile.min`:
   ```dockerfile
   # create from alpine image
   FROM alpine:latest

   # update system, install nginx and clean
   RUN apk update && apk upgrade && \
       apk add nginx && \
       rm -rf /var/cache/apk/*

   # copy site
   COPY site /var/www/html

   # expose port 80
   EXPOSE 80

   # run nginx
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. Am construit imaginea optimizată:
   ```bash
   docker image build -t mynginx:minx -f Dockerfile.min .
   ```

3. Am repackat imaginea finală pentru optimizare maximă:
   ```bash
   docker container create --name mynginx mynginx:minx
   docker container export mynginx -o min.tar
   docker image import min.tar mynginx:min
   docker container rm mynginx
   rm min.tar
   ```

### Rezultate obținute

După execuția tuturor comenzilor, am verificat dimensiunea imaginilor create:

```bash
docker image list
```

| REPOSITORY | TAG    | SIZE     |
|------------|--------|----------|
| mynginx    | raw    | 174 MB   |
| mynginx    | clean  | 174 MB   |
| mynginx    | few    | 125 MB   |
| mynginx    | alpine | 11.8 MB  |
| mynginx    | repack | 134 MB   |
| mynginx    | minx   | 9.3 MB   |
| mynginx    | min    | 9.27 MB  |

## Răspunsuri la întrebări

1. **Care metodă de optimizare a imaginilor vi se pare cea mai eficientă?**
   
   Cea mai eficientă metodă este combinarea utilizării unei imagini de bază minime (Alpine) cu curățarea cache-urilor și repachetarea finală a imaginii. Dimensiunea imaginii a fost redusă de la 174 MB până la 9.27 MB, ceea ce reprezintă o reducere de aproximativ 95%. Utilizarea singură a Alpine ca imagine de bază a dus la o reducere semnificativă de aproximativ 93%, ceea ce arată că alegerea unei imagini de bază minime este probabil cel mai important factor în optimizare.

2. **De ce curățirea cache-ului pachetelor într-un strat separat nu reduce dimensiunea imaginii?**
   
   Curățirea cache-ului pachetelor într-un strat separat nu reduce semnificativ dimensiunea imaginii deoarece Docker utilizează un sistem de fișiere în straturi. Când creăm un nou strat prin curățirea cache-urilor, fișierele sunt șterse doar în acel strat, dar straturile anterioare care conțin cache-urile rămân neschimbate. Dimensiunea totală a imaginii va include toate straturile, inclusiv cele cu fișierele șterse. Pentru a obține o optimizare reală, curățarea cache-ului trebuie făcută în același strat RUN în care sunt instalate pachetele.

3. **Ce este repachetarea imaginii?**
   
   Repachetarea imaginii este procesul de exportare a unui container bazat pe o imagine și apoi importarea acestuia ca o nouă imagine. Acest proces comprimă toate straturile într-un singur strat nou, eliminând metadatele inutile și unitățile de stocare nefolosite. Rezultatul este o imagine mai compactă, deși acest proces poate elimina unele metadate utile și poate face debugging-ul mai dificil. De asemenea, repachetarea elimină istoricul straturilor, ceea ce poate fi considerat un avantaj pentru securitate, dar poate face mai dificilă înțelegerea modului în care a fost construită imaginea.

## Concluzii

În cadrul acestui laborator am învățat diverse metode de optimizare a imaginilor Docker:

1. **Curățirea dependențelor neutilizate** reduce dimensiunea imaginii, dar este eficientă doar când se face în același strat cu instalarea pachetelor.

2. **Reducerea numărului de straturi** prin combinarea comenzilor RUN îmbunătățește ușor dimensiunea imaginii și accelerează procesul de construire.

3. **Utilizarea unei imagini de bază minime** precum Alpine este cea mai eficientă metodă individuală pentru reducerea dimensiunii imaginilor.

4. **Repachetarea imaginii** poate reduce și mai mult dimensiunea finală prin eliminarea metadatelor inutile și comprimarea tuturor straturilor.

5. **Combinarea tuturor metodelor** oferă cel mai bun rezultat, reducând dimensiunea imaginii cu aproximativ 95%.

Optimizarea imaginilor Docker este esențială pentru micșorarea timpului de descărcare, reducerea spațiului de stocare și îmbunătățirea performanței. În funcție de cerințe, putem alege metodele cele mai potrivite pentru echilibrul între dimensiune, funcționalitate și complexitatea buildului.