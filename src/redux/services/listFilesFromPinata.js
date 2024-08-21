import { PinataSDK } from 'pinata';

const PINATA_GATEWAY_URL = import.meta.env.VITE_REACT_APP_PINATA_GATEWAY;
const PINATA_JWT = import.meta.env.VITE_REACT_APP_PINATA_JWT_SECRET_ACCESS_TOKEN;

const pinata = new PinataSDK({
    pinataJwt: PINATA_JWT,
    pinataGateway: PINATA_GATEWAY_URL,
});

async function listNFTs() {
    try {
        const response = await pinata
        .listFiles()
        .pageLimit(100);

        const filteredResponse = response.filter(file => file.mime_type === 'application/json');

        return filteredResponse;
    } catch(error) {
        return error;
    }
} 

export { listNFTs };