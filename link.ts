export const addLinkToElement = (element: SVGElement, link: string): void => {
    const linkElement = document.createElementNS('http://www.w3.org/2000/svg', 'a');
    linkElement.setAttribute('href', link);
    linkElement.setAttribute('target', '_blank');
    
    if (element.parentNode) {
      element.parentNode.insertBefore(linkElement, element);
      linkElement.appendChild(element);
    }
  };