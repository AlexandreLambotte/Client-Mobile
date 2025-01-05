Lien pour telecharger l'API :

https://henallux-my.sharepoint.com/:u:/g/personal/etu52875_henallux_be/EaAG3NPC43RLq2PhAkevCyoB314ZA6mLLzzYrkb7anEEMQ?e=aA497Z

Installation de l'API

Préparation de la BD

Avec Docker, exécuter la commande :
docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_USER=admin -e POSTGRES_DB=walkthrough -p 5432:5432 --rm -d postgres

Enfin, exécuter à l'intérieur du répertoire la commande suivante pour initialiser la BD et lancer l'API

npm run start-all

l'API devrait normalement être disponible à http://localhost:3001