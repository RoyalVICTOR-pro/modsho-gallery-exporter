console.log('App Launched!');

const fs = require('fs')
const sanitize = require('sanitize-filename'); 

const dev = true;

const dataFile = dev ? './data/sample_data.json' : './data/real_data.json';
const root_id = dev ? 1 : 75897;
const rootFolder = dev ? './data/sample_files/' : './data/real_files/';
const exportFolder = './export/';

let currentFolder = [];

const cleanFolderName = (folderName) => {
  return sanitize(folderName).replace(/\s+/g, '-');
}

const pathCleaner = (rootFolder, currentFolder, folderName) => {
  if (currentFolder.length === 0) {
    return rootFolder + cleanFolderName(folderName);
  }
  return rootFolder + currentFolder.join('/') + '/' + cleanFolderName(folderName);
}

const getFileName = (path, extension = true) => {
  const tmp = path.split('/');
  if (extension) {
    return tmp[tmp.length - 1];
  } else {
    const tmp2 = tmp[tmp.length - 1].split('.');
    return tmp2[0];
  }
}


const copyMedia = (foundFile, destinationPath) => {
    console.log(`Copie de ${rootFolder + foundFile.path} vers ${destinationPath + '/' + getFileName(foundFile.path)}`);
    fs.copyFileSync(rootFolder + foundFile.path, destinationPath + '/' + getFileName(foundFile.path));
}

const createCaptionAndInfoTextFile = (mediaItem, folder, foundFile) => {
  
  let text = '';
  if (mediaItem.captionFr && mediaItem.captionFr !== '') {
    text = `${text}Légende FR : \n---------------------\n${mediaItem.captionFr}\n---------------------\n\n`;
  }

  if (mediaItem.infoFr && mediaItem.infoFr !== '') {
    text = `${text}Informations FR : \n---------------------\n${mediaItem.infoFr}\n---------------------\n\n\n########################################################\n\n`;
  }
  if (mediaItem.captionEn && mediaItem.captionEn !== '') {
    text = `${text}Légende EN : \n---------------------\n${mediaItem.captionEn}\n---------------------\n\n`;
  }
  if (mediaItem.infoEn && mediaItem.infoEn !== '') {
    text = `${text}Informations EN : \n---------------------\n${mediaItem.infoEn}\n---------------------\n`;
  }
  // console.log(`Création d'un fichier ${folder + '/' + mediaItem.name + '.txt'} avec le contenu ${text}`);
  fs.writeFileSync(folder + '/' + getFileName(foundFile.path, false) + '.txt', text);
}

const constructTree = (currentId, galleries, files) => {
  const foundFolder = galleries.find(el => el.id === currentId); 

  const folderCleanedPath = pathCleaner(exportFolder, currentFolder, foundFolder.name);
  fs.mkdirSync(folderCleanedPath);
  console.log('Dossier créé : ', folderCleanedPath);
  currentFolder.push(cleanFolderName(foundFolder.name));
  
  for (let file of foundFolder.medias) {
    // console.log(`Copie du fichier ${file.name} dans le dossier ${folderCleanedPath}`);
    const foundFile = files.find(el => el.id === file.file);
    if (foundFile) {
      copyMedia(foundFile, folderCleanedPath, files);
      if (file.captionFr || file.infoFr)
        createCaptionAndInfoTextFile(file, folderCleanedPath, foundFile);
    }
  }

  for (let folder of galleries) {
    // console.log('folder.name :>> ', folder.name);
    if (folder.parentId === foundFolder.id)
      constructTree(folder.id, galleries, files);
  };
  currentFolder.pop(); 
  return; 
}

fs.readFile(dataFile, 'utf-8', (err, data) => {
 
  if (err)
    return console.log('Error 1 !', err);

  const dataObject = JSON.parse(data);

  constructTree(root_id, dataObject.galleries, dataObject.files);

})