// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SimpleStorage {
    string private data; // store encrypted string

    function setData(string memory _data) public {
        data = _data;
    }

    function getData() public view returns (string memory) {
        return data;
    }
}
