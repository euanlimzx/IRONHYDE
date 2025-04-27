export function processInteractions(interactions) {
  const result = [];

  // Recursive function to process each interaction
  function processInteraction(interaction, parentName = "", stepNumber = 1) {
    if (interaction.children.length === 0) {
      // If no children, add the interaction with a numbered step
      result.push({
        id: interaction.id,
        name: `${parentName}${stepNumber}. ${interaction.name}`,
      });
    } else {
      // If there are children, accumulate the name and process the children
      let currentName = `${parentName} ${stepNumber}. ${interaction.name} `;

      // Process each child with the next step number
      interaction.children.forEach((child, index) => {
        processInteraction(child, currentName, stepNumber + 1);
      });
    }
  }

  interactions.forEach((interaction) => {
    // Start with step 1 for the root-level interactions
    processInteraction(interaction);
  });

  return result;
}
