const render = (variant, studentId) => `
# Évaluation individuelle

## Exercice 1

Rendre votre définition du mot ${variant(["exercice", "évaluation", "examen"])}.

## Exercice 2

Consulter l'énoncé d'un autre étudiant, exemple: [/${studentId + 1}](/${studentId + 1}).
`;

const variantPicker = (studentId) => (variants) => variants[studentId % variants.length]

window.énoncé = (studentId) => render(variantPicker(studentId), studentId);
