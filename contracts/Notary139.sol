// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

contract Notary139 {
    struct storedContract {
        string content;
        string contractStatus;    
    }

    storedContract public newContract;

    function getContent139() public view returns (string memory) {
        return newContract.content;
    }

    function setContent139(string memory newwords) public {
        newContract.content = newwords;   
    }

    function getContractStatus139() public view returns (string memory) {
        return newContract.contractStatus;
    }

    function setContractStatus139(string memory newStatus) public {
        newContract.contractStatus = newStatus;   
    }
}
