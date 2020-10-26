const fs = require('fs');

module.exports = {
  asyncForEach: async function(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  },

  randomGenerator: function(low, high) {
    return Math.random() * (high - low) + low
  },

  fileExist: function(filePath) {
    return new Promise((resolve, reject) => {
      fs.access(filePath, fs.F_OK, (err) => {
        if (err) {
           resolve(false);
       }
        //file exists
        resolve(true);
      })
    });
   }
 
};
