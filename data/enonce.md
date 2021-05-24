# Évaluation individuelle

## Exercice 1

Rendre votre définition du mot ${variant(["exercice", "évaluation", "examen"])}.

## Exercice 2

Consulter l'énoncé d'un autre étudiant, exemple: [studentId=${parseInt(studentId) + 1}](./?studentId=${parseInt(studentId) + 1}).

<!-- pour essayer l'importation de variables externes:
  $ TEMPLATE="data/enonce.md" LOAD_VARS_FROM_TEMPLATE="data/sample-variables.md" npx . deploy
-->
${ (this.externalVar || {}).somePlaceholder || '' }
