export const arcadianHeadImages = [];

export async function queryArcadian(id) {
  const partsUrl =
    'https://nftstorage.link/ipfs/bafybeib2ir3zpgd3cmizcv7shekjeftcwq7apjib6i5gz2sjc4vajwtgiy';

  // this is the same url that you get from querying token uri from the contract
  const url = 'https://api.arcadians.io/' + id;

  return new Promise((resolve, reject) => {
    // create a GET request
    var xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.readyState === xhr.DONE) {
        if (xhr.status !== 200) reject(null);
        let gender = 'female';
        var data = JSON.parse(xhr.response);
        console.log('data', data);

        const headPart = data.attributes.find(
          (trait) => trait.trait_type === 'Head'
        );
        const genderPart = data.attributes.find(
          (trait) => trait.trait_type === 'Class'
        );
        if (genderPart.value.match('Male')) gender = 'male';
        const headUrl = headPart.value.toLowerCase().replaceAll(' ', '-');
        var img = new Image();
        img.src = `${partsUrl}/${gender}/head/${headUrl}.png`;
        img.addEventListener(
          'load',
          () => {
            localStorage.setItem('Arcadian #' + id, xhr.response);
            arcadianHeadImages.push(img);
            resolve(img);
          },
          false
        );
      }
    };
    xhr.open('GET', url);
    xhr.send();
  });
}
