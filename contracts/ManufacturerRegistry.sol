// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ManufacturerRegistry {
    address public medChainContract;
    address public admin;
    
    struct KYCDocument {
        string documentHash;
        string documentType;
        uint256 uploadedAt;
        bool isVerified;
    }
    
    mapping(address => KYCDocument[]) public kycDocuments;
    
    event KYCDocumentUploaded(
        address indexed manufacturer,
        string documentHash,
        string documentType,
        uint256 timestamp
    );
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier onlyMedChain() {
        require(msg.sender == medChainContract, "Only MedChain contract");
        _;
    }
    
    constructor(address _medChainContract) {
        medChainContract = _medChainContract;
        admin = msg.sender;
    }
    
    function uploadKYCDocument(
        string memory _documentHash,
        string memory _documentType
    ) external {
        kycDocuments[msg.sender].push(KYCDocument({
            documentHash: _documentHash,
            documentType: _documentType,
            uploadedAt: block.timestamp,
            isVerified: false
        }));
        
        emit KYCDocumentUploaded(msg.sender, _documentHash, _documentType, block.timestamp);
    }
    
    function verifyKYCDocument(
        address _manufacturer,
        uint256 _documentIndex
    ) external onlyAdmin {
        require(_documentIndex < kycDocuments[_manufacturer].length, "Invalid document index");
        kycDocuments[_manufacturer][_documentIndex].isVerified = true;
    }
    
    function getKYCDocuments(address _manufacturer) 
        external 
        view 
        returns (KYCDocument[] memory) 
    {
        return kycDocuments[_manufacturer];
    }
    
    function updateMedChainContract(address _newContract) external onlyAdmin {
        medChainContract = _newContract;
    }
}
