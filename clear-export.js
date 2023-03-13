const fs = require('fs');

// directory path
// const dir = './export/Accueil'
const dir = './export/Dossier-Racine-1'

// delete directory recursively
fs.rmdir(dir, { recursive: true }, err => {
  if (err) {
    throw err
  }

  console.log(`${dir} is deleted!`)
})