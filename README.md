# Énoncé

Application Web de rendu d'énoncé avec variantes, pour évaluer les étudiant·e·s de manière individuelle.

_Énoncé_ est une alternative partielle à [`js-test`](https://github.com/adrienjoly/js-test). Elle a vocation d'être plus minimale et agnostique, au niveau technique mais aussi vis à vis de l'interface avec les étudiant·e·s. En effet, elle ne gère pas le rendu des étudiant·e·s. _Énoncé_ se contente de générer un énoncé partiellement individualisé pour chaque identifiant d'étudiant·e.

## Demo

- [adrienjoly.com/enonce/?studentId=1](https://adrienjoly.com/enonce/?studentId=1)

## Exemple d'usage pour l'enseignant

1. Écrire l'énoncé du devoir au format Markdown, dans le fichier `data/enonce.md`.

2. [Optionnel] Ajouter des variantes dans l'énoncé, en fonction du nombre passé en paramètre.

3. Publier l'énoncé sur `surge.sh` à l'aide du script `npm run deploy`.

4. Attribuer à chaque étudiant·e un numéro unique aléatoire, puis leur transmettre l'URL de l'énoncé incluant ce numéro en paramètre. Leur demander de rendre leur travail via la plateforme de votre choix. (ex: email ou autre)

5. Au moment de la correction des copies, ouvrir l'URL dédiée de chaque étudiant·e, pour corriger le rendu en fonction de sa variante d'énoncé.

## Exemple d'usage pour l'enseignant – avec Google Classroom

L'usage de Google Classroom demande un peu plus de configuration mais permet de simplifier la génération et transmission des énoncés aux étudiant·e·s.

- Avant de commencer, créer un projet et un identifiant OAuth 2.0 permettant d'accéder à l'[API de Google Classroom](https://console.cloud.google.com/marketplace/product/google/classroom.googleapis.com), puis coller le `client_id` ainsi obtenu dans la propriété `google_signin_client_id` du fichier `data/auth.json`.

- À l'étape 4, au lieu d'attribuer un numéro aléatoire à chaque étudiant·e, récupérer la liste des étudiants depuis Google Classroom (ex: à l'aide du CLI [gclass](https://www.npmjs.com/package/gclass)) puis vérifier le numéro de variante de chaque étudiant·e, calculé à partir de leur adresse email. (cf `$ npm run check student-variants`, documenté plus bas)

- Créer un devoir sur Google Classroom, avec un lien direct vers la racine de l'énoncé qui a été publié sur `surge.sh`.

- Inviter les étudiant·e·s à s'identifier sur la page d'énoncé avec leur compte Google Classroom – en cliquant sur le bouton – puis à rendre leur travail via le devoir Google Classroom.

- [Optionnel] Utiliser [gclass](https://www.npmjs.com/package/gclass) ou [classroom-submissions-to-pdf](https://github.com/adrienjoly/classroom-submissions-to-pdf) pour télécharger les rendus.

- [Idée] Rendre un document Google Docs à chaque étudiant·e incluant son énoncé et son rendu, pour faciliter les annotations et échanges sur la copie.

## CLI

```sh
$ git clone https://github.com/adrienjoly/enonce.git
$ cd enonce
$ npm install
$ npm test
$ npm run check combinations   # from data/enonce.md => 3
$ npm run check render 422     # render statement for student #422
$ npm start                    # to test the UI locally
$ npm run deploy               # to deploy using surge.io
```

Get the distribution of variants among students, from a csv list of students with email address in the first column:

```sh
$ cat students.csv | cut -d, -f1 | npm run check student-variants
# => e.g. { studentsPerVariant: [ 4, 7, 8 ] }
```
