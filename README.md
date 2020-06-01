### Upload service
Service permettant de :
- télécharger des fichiers audio correspondant à l'id youtube transmis
- Vérifier si une musique à été téléchargé

##Routes
- POST /upload/:youtubeId : téléchargement de l'audio : 204 
- Get /upload/:youtubeId : verifie en base l'existence du fichier : null | {fileInfos}

##Events sent
- upload-error {trackId}
- progress-upload {trackId, progress}
- uploaded {trackId, progress}

##Todo 
- Améliorer gestion d'erreur (rabbitMq, mongo)
