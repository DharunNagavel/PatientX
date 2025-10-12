// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ConsentRegistry {
    struct Consent {
        address owner;
        mapping(address => bool) allowed;
    }

    mapping(bytes32 => Consent) private consents;

    function storeData(bytes32 dataHash) public {
        consents[dataHash].owner = msg.sender;
    }

    function grantConsent(bytes32 dataHash, address requester) public {
        require(msg.sender == consents[dataHash].owner, "Only owner can grant");
        consents[dataHash].allowed[requester] = true;
    }

    function checkConsent(bytes32 dataHash, address requester) public view returns (bool) {
        return consents[dataHash].allowed[requester];
    }
}
