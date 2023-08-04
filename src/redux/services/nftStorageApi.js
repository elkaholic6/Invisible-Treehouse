import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_KEY = import.meta.env.VITE_REACT_APP_NFT_STORAGE_KEY;

const baseQuery = fetchBaseQuery({
    headers: {
        Authorization: `Bearer ${API_KEY}`,
    },
    baseUrl: "https://api.nft.storage/",
    
});

export const nftStorageApi = createApi({
    baseQuery,
    endpoints: (builder) => ({
        fetchNfts: builder.query({
            query: () => '/?limit=1000',
        }),
    }),
});

export const { useFetchNftsQuery } = nftStorageApi;