import { emit } from 'kontra';
import { ARCADIAN_ADDED, ARCADIAN_HEAD_SELECTED } from './gameEvents';
import { setArcadianData } from './store';

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
            localStorage.setItem('Arcadian #' + id, img);
            setArcadianData({ id, data, img });
            resolve({ id, data, img });
          },
          false
        );
      }
    };
    xhr.open('GET', url);
    xhr.send();
  });
}

export const fetchArcadianHeads = (startId = 0) => {
  return new Promise((resolve) => {
    const promises = [];
    for (let i = startId; i < 100; i = i + 5) {
      if (i === 0) continue;
      const promise = queryArcadian(i);
      promises.push(promise);
    }
    Promise.allSettled(promises).then((res) => {
      emit(ARCADIAN_HEAD_SELECTED, { img: res[0].value });
      resolve(res);
    });
  });
};
