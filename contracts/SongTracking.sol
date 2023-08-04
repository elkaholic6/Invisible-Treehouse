// SPDX-License-Identifier: MIT
// pragma solidity ^0.8.17;

// import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// contract SongTracking {
//     using ECDSA for bytes32;

//     mapping(bytes32 => uint256) public streamCounts;
//     // mapping(bytes32 => mapping(address => bool)) public playbackHistory;

//     event SongStreamed(bytes32 indexed songId, address indexed user, uint256 duration);

//     function streamSong(bytes32 songId, uint256 duration, bytes memory signature) external {
//         // Concatenate the song ID, duration, and sender's address into a single message
//         bytes32 message = keccak256(abi.encodePacked(songId, duration, msg.sender));

//         // Verify the signature to ensure the authenticity of the request
//         require(message.recover(signature) == msg.sender, "Invalid signature");

//         // Check if the song has already been played by the sender
//         // require(!playbackHistory[songId][msg.sender], "Song already played");

//         // Update the stream count for the song
//         streamCounts[songId]++;

//         // Mark the song as played by the sender
//         // playbackHistory[songId][msg.sender] = true;

//         // Emit the event to signal that the song has been streamed
//         emit SongStreamed(songId, msg.sender, duration);
//     }
// }