# Énoncé

Application Web de rendu d'énoncé avec variantes, pour évaluer les étudiant·e·s de manière individuelle.

_Énoncé_ est une alternative partielle à [`js-test`](https://github.com/adrienjoly/js-test). Elle a vocation d'être plus minimale et agnostique, au niveau technique mais aussi vis à vis de l'interface avec les étudiant·e·s. En effet, elle ne gère pas le rendu des étudiant·e·s. _Énoncé_ se contente de générer un énoncé partiellement individualisé pour chaque identifiant d'étudiant·e.

## Demo

- [adrienjoly.com/enonce/?id=1](https://adrienjoly.com/enonce/?id=1)

## Exemple d'usage pour l'enseignant

1. Écrire l'énoncé du devoir au format Markdown, dans le fichier `enonce.md`.

2. [Optionnel] Ajouter des variantes dans l'énoncé, en fonction du nombre passé en paramètre.

3. Publier l'énoncé sur `surge.sh` à l'aide du script `publish.sh`.

4. Attribuer à chaque étudiant·e un numéro unique aléatoire, puis leur transmettre l'URL de l'énoncé incluant ce numéro en paramètre. Leur demander de rendre leur travail via la plateforme de votre choix. (ex: email ou autre)

5. Au moment de la correction des copies, ouvrir l'URL dédiée de chaque étudiant·e, pour corriger le rendu en fonction de sa variante d'énoncé.

## Exemple d'usage pour l'enseignant – avec Google Classroom

L'usage de Google Classroom permet de simplifier l'étape 4: la génération et transmission d'un numéro unique aléatoire à chaque étudiant·e.

- À l'étape 4, au lieu d'attribuer un numéro aléatoire à chaque étudiant·e, récupérer leur numéro d'identifiant Google Classroom à l'aide de [classroom-assignments-cli](https://github.com/adrienjoly/classroom-assignments-cli).

- Créer un devoir sur Google Classroom, avec un lien direct vers la page de connexion de l'énoncé (`/login`) qui a été publié sur `surge.sh`.

- Inviter les étudiant·e·s à s'identifier sur la page d'énoncé avec leur compte Google Classroom – en cliquant sur le bouton – puis à rendre leur travail via le devoir Google Classroom.

- [Optionnel] Utiliser [classroom-assignments-cli](https://github.com/adrienjoly/classroom-assignments-cli) ou [classroom-submissions-to-pdf](https://github.com/adrienjoly/classroom-submissions-to-pdf) pour télécharger les rendus.

- [Idée] Rendre un document Google Docs à chaque étudiant·e incluant son énoncé et son rendu, pour faciliter les annotations et échanges sur la copie.
