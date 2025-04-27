export function processInteractions(interactions) {
  const result = [];

  // Recursive function to process each interaction
  function processInteraction(interaction, parentName = "", stepNumber = 1) {
    if (interaction.children.length === 0) {
      // If no children, add the interaction with a numbered step
      result.push({
        id: interaction.id,
        name: `${parentName}${stepNumber}. ${interaction.name}`,
        expected_result: interaction.expected_result,
        page_url: interaction.page_url,
        interaction_description: `${parentName}${stepNumber}. ${interaction.name}`,
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
  console.log(result);
  return result;
}

export function processSingleInteraction(interactions, targetId) {
  function search(interaction, path = [], step = 1) {
    const newPath = [...path, { step, name: interaction.name }];

    if (interaction.id === targetId) {
      return {
        id: interaction.id,
        name: newPath.map((p) => `${p.step}. ${p.name}`).join(" "),
        expected_result: interaction.expected_result,
        page_url: interaction.page_url,
        interaction_description: newPath
          .map((p) => `${p.step}. ${p.name}`)
          .join(" "),
      };
    }

    for (let i = 0; i < (interaction.children || []).length; i++) {
      const child = interaction.children[i];
      const result = search(child, newPath, step + 1);
      if (result) return result;
    }
    return null;
  }

  for (let i = 0; i < interactions.length; i++) {
    const interaction = interactions[i];
    const result = search(interaction, [], 1);
    if (result) return result;
  }

  return null; // Not found
}
