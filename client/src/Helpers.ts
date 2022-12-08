export const random: (min: number, max: number) => number = (min: number = 0, max: number = 100) => Math.floor(Math.random() * (max - min)) + min;

export const getFullName: ({ firstName, lastName }: { firstName: string, lastName: string; }) => string = ({ firstName, lastName }) => { return `${firstName || ''} ${lastName || ''}`.trim() }


export const parseJwt: (token: string) => object = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);

}


/**
 * Remove all elements from the parent node by tag name.
 * @constructor
 * @param {HTMLElement | null} parentElement - The Parent Element.
 * @param {string} tagName - The Tag Name.
 */
export const removeElementByTagName: (parentElement: HTMLElement | null, tagName: string) => void = (parentElement, tagName) => {
  const elementList = parentElement?.getElementsByTagName(tagName);
  if (elementList) while (elementList[0]) elementList[0].parentNode?.removeChild(elementList[0])
}