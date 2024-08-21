// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// const API_KEY = import.meta.env.VITE_REACT_APP_NFT_STORAGE_KEY;

// const baseQuery = fetchBaseQuery({
//     headers: {
//         Authorization: `Bearer ${API_KEY}`,
//     },
//     baseUrl: "https://api.nft.storage/",
    
// });

// export const nftStorageApi = createApi({
//     baseQuery,
//     endpoints: (builder) => ({
//         fetchNfts: builder.query({
//             query: () => '/?limit=1000',
//         }),
//     }),
// });

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const PINATA_GATEWAY_URL = import.meta.env.VITE_REACT_APP_PINATA_GATEWAY;
const PINATA_JWT = import.meta.env.VITE_REACT_APP_PINATA_JWT_SECRET_ACCESS_TOKEN;

const baseQuery = fetchBaseQuery({
    baseUrl: "https://api.pinata.cloud/",
    headers: {
        pinataJwt: PINATA_JWT,
        pinataGateway: PINATA_GATEWAY_URL,
    },
});

export const pinataApi = createApi({
    baseQuery,
    endpoints: (builder) => ({
        fetchNfts: builder.query({
            query: () => `data/pinList?status=pinned&pageLimit=1000`, // Adjust the endpoint and query parameters as needed
        }),
    }),
});

export const { useFetchNftsQuery } = pinataApi;