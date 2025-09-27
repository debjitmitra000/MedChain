// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IMedChain {
    struct MedicineBatch {
        string batchId;
        string medicineName;
        address manufacturer;
        uint256 manufacturingDate;
        uint256 expiryDate;
        bool isActive;
        bool isRecalled;
        uint256 createdAt;
        uint256 expiredScanCount;
    }
    
    struct Manufacturer {
        address wallet;
        string name;
        string license;
        string email;
        bool isVerified;
        bool isActive;
        uint256 registeredAt;
    }
    
    struct ExpiredMedicineReport {
        string batchId;
        string medicineName;
        address manufacturer;
        uint256 expiredScanCount;
        uint256 lastScannedAt;
    }
    
    // Core functions
    function registerManufacturer(
        address _manufacturer, 
        string memory _name, 
        string memory _license,
        string memory _email
    ) external;
    
    function verifyManufacturer(address _manufacturer) external;
    
    function registerMedicineBatch(
        string memory _batchId,
        string memory _medicineName,
        uint256 _manufacturingDate,
        uint256 _expiryDate
    ) external;
    
    function verifyBatch(string memory _batchId) external view returns (MedicineBatch memory);
    
    function markBatchRecalled(string memory _batchId) external;
    
    function recordExpiredScan(string memory _batchId) external;
    
    function getExpiredMedicineReports() external view returns (ExpiredMedicineReport[] memory);
    
    // NEW: Enumeration functions
    function getAllManufacturerAddresses() external view returns (address[] memory);
    
    function getManufacturerCount() external view returns (uint256);
}
