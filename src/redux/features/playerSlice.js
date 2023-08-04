import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSongs: [],
  currentIndex: 5,
  isActive: false,
  isPlaying: false,
  activeSong: {},
  songData: {},
  songId: [],
  songUrlArray: [],
  currentTitle: '',
  currentArtist: '',
  songCoverArt: {},
  genreListId: 'ALL',
};


const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setActiveSong: (state, action) => {
      state.activeSong = action.payload.animation_url;
      state.currentTitle = action.payload.name;
      state.currentArtist = action.payload.artist;
      state.songCoverArt = action.payload.image;
      state.songUrlArray = action.payload.songArr;
      state.songData = action.payload;
      state.currentSongs = action.payload.songList;

      let idArr = []
        for (let i = 0; i < action.payload.songList.length; i++) {
            const dataIds = action.payload.songList[i].cid;
            idArr.push(dataIds)
        };
      let songIndex = idArr.findIndex((song) => song === action.payload.id)

      state.currentIndex = songIndex;
      state.songId = action.payload.id;
      state.isActive = true;
    },

    setNewIndex: (state, action) => {
      state.currentIndex = action.payload;
    },

    nextSong: (state, action) => {
      state.activeSong = state.currentSongs[action.payload].animation_url;
      state.currentTitle = state.currentSongs[action.payload].name;
      state.songCoverArt = state.currentSongs[action.payload].image;
      state.currentArtist = state.currentSongs[action.payload].properties.artist;

      state.currentIndex = action.payload;
      state.isActive = true;
    },

    prevSong: (state, action) => {
      state.activeSong = state.currentSongs[action.payload].animation_url;
      state.currentTitle = state.currentSongs[action.payload].name;
      state.songCoverArt = state.currentSongs[action.payload].image;
      state.currentArtist = state.currentSongs[action.payload].properties.artist;

      state.currentIndex = action.payload;
      state.isActive = true;
    },

    playPause: (state, action) => {
      state.isPlaying = action.payload;
    },

    selectGenreListId: (state, action) => {
      state.genreListId = action.payload;
    },
  },
});

export const { setActiveSong, setNewIndex, nextSong, prevSong, playPause, selectGenreListId } = playerSlice.actions;

export default playerSlice.reducer;
