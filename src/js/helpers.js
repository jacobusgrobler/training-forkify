//FILE IS USED FOR FUNCTIONS THAT WILL BE USED OVER AND OVER IN THE PROJECT

import { async } from 'regenerator-runtime';
import { MAXLATENCY } from './config';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};
//Const AJAX is now the call to load from the API and upload to the API
export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', //Don,t fucking tell me it was the spaces.
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    const response = await Promise.race([fetchPro, timeout(MAXLATENCY)]); //fetch promise racing against timeout promise
    const forkifyAPIdata = await response.json();

    if (!response.ok)
      throw new Error(`${forkifyAPIdata.message} (${response.status})`);
    return forkifyAPIdata;

    console.log(response);
    console.log(forkifyAPIdata);
  } catch (err) {
    throw err;
  }
};

const clearBookmarks = function () {
  localStorage.clear(bookmarks);
};
//clearBookmarks();
