/**
 * Removes the element with the specified ID from the DOM.
 * @param {string} id - The ID of the element to be removed.
 */
function closeMessage(id) {
  const alert = document.getElementById(id);
  if (alert) {
    alert.remove();  
  } else {
    console.warn(`Element with ID '${id}' not found.`);
  }
}
