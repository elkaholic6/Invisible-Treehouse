export default async function fetchIPFSMetadata(data) {
    try {
        const metadataArray = [];
        for (const song of data.value) {
            const response = await fetch(`https://ipfs.io/ipfs/${song.cid}/metadata.json`);
            const metadata = await response.json();
            const cleanedAudio = metadata.animation_url.replace('ipfs://', 'https://ipfs.io/ipfs/');
            const cleanedImage = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');

            const cleanedMetadata = {
                ...metadata,
                animation_url: cleanedAudio,
                image: cleanedImage,
                cid: song.cid
            }

            metadataArray.push(cleanedMetadata);
        }
        return metadataArray;
    } catch (error) {
        console.log('Error fetching metadata', error);
    }
}