// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IMedChain.sol";

contract MedChain is IMedChain {
    address public admin;
    uint256 public totalBatches;
    uint256 public totalManufacturers;
    uint256 public totalRecalledBatches;
    uint256 public totalExpiredScans;
    
    mapping(string => MedicineBatch) public batches;
    mapping(address => Manufacturer) public manufacturers;
    mapping(address => bool) public isManufacturer;
    mapping(address => string[]) public manufacturerBatches;
    mapping(string => bool) public batchExists;
    
    address[] public manufacturerAddresses;
    mapping(address => uint256) public manufacturerIndex;
    
    string[] public expiredBatchIds;
    mapping(string => bool) public isExpiredBatchTracked;
    
    event ManufacturerRegistered(address indexed manufacturer, string name, string email, uint256 timestamp);
    event ManufacturerVerified(address indexed manufacturer, uint256 timestamp);
    event MedicineBatchRegistered(string indexed batchId, string medicineName, address indexed manufacturer, uint256 expiryDate, uint256 timestamp);
    event BatchVerified(string indexed batchId, address indexed verifier, uint256 timestamp);
    event BatchRecalled(string indexed batchId, address indexed manufacturer, uint256 timestamp);
    event FakeBatchDetected(string indexed batchId, address indexed detector, uint256 timestamp);
    event ExpiredBatchScanned(string indexed batchId, address indexed scanner, uint256 scanCount, uint256 timestamp);
    
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }
    
    modifier onlyVerifiedManufacturer() {
        require(isManufacturer[msg.sender] && manufacturers[msg.sender].isVerified && manufacturers[msg.sender].isActive);
        _;
    }
    
    modifier batchOwner(string memory _batchId) {
        require(batches[_batchId].manufacturer == msg.sender);
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    // UPDATED: Allow self-registration - removed onlyAdmin modifier
    function registerManufacturer(address _manufacturer, string memory _name, string memory _license, string memory _email) external override {
        // Allow self-registration or admin can register others
        require(_manufacturer == msg.sender || msg.sender == admin, "Can only register yourself or admin can register others");
        require(_manufacturer != address(0) && !isManufacturer[_manufacturer], "Invalid address or already registered");
        require(bytes(_name).length > 0 && bytes(_license).length > 0 && bytes(_email).length > 0, "Missing required fields");
        require(_isValidEmail(_email), "Invalid email format");
        
        manufacturers[_manufacturer] = Manufacturer({
            wallet: _manufacturer,
            name: _name,
            license: _license,
            email: _email,
            isVerified: false,  // Always start as unverified
            isActive: true,
            registeredAt: block.timestamp
        });
        
        isManufacturer[_manufacturer] = true;
        manufacturerIndex[_manufacturer] = manufacturerAddresses.length;
        manufacturerAddresses.push(_manufacturer);
        totalManufacturers++;
        
        emit ManufacturerRegistered(_manufacturer, _name, _email, block.timestamp);
    }
    
    function getAllManufacturerAddresses() external view returns (address[] memory) {
        return manufacturerAddresses;
    }
    
    function getManufacturerCount() external view returns (uint256) {
        return manufacturerAddresses.length;
    }
    
    function verifyManufacturer(address _manufacturer) external override onlyAdmin {
        require(isManufacturer[_manufacturer] && !manufacturers[_manufacturer].isVerified, "Not registered or already verified");
        manufacturers[_manufacturer].isVerified = true;
        emit ManufacturerVerified(_manufacturer, block.timestamp);
    }
    
    function deactivateManufacturer(address _manufacturer) external onlyAdmin {
        require(isManufacturer[_manufacturer], "Manufacturer not registered");
        manufacturers[_manufacturer].isActive = false;
    }
    
    function updateAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin address");
        admin = _newAdmin;
    }
    
    function registerMedicineBatch(string memory _batchId, string memory _medicineName, uint256 _manufacturingDate, uint256 _expiryDate) external override onlyVerifiedManufacturer {
        require(bytes(_batchId).length > 0 && bytes(_medicineName).length > 0 && !batchExists[_batchId], "Invalid batch data or batch exists");
        require(_manufacturingDate < _expiryDate && _manufacturingDate <= block.timestamp && _expiryDate > block.timestamp, "Invalid dates");
        
        batches[_batchId] = MedicineBatch({
            batchId: _batchId,
            medicineName: _medicineName,
            manufacturer: msg.sender,
            manufacturingDate: _manufacturingDate,
            expiryDate: _expiryDate,
            isActive: true,
            isRecalled: false,
            createdAt: block.timestamp,
            expiredScanCount: 0
        });
        
        batchExists[_batchId] = true;
        manufacturerBatches[msg.sender].push(_batchId);
        totalBatches++;
        
        emit MedicineBatchRegistered(_batchId, _medicineName, msg.sender, _expiryDate, block.timestamp);
    }
    
    function markBatchRecalled(string memory _batchId) external override onlyVerifiedManufacturer batchOwner(_batchId) {
        require(batchExists[_batchId] && !batches[_batchId].isRecalled, "Batch not found or already recalled");
        
        batches[_batchId].isRecalled = true;
        batches[_batchId].isActive = false;
        totalRecalledBatches++;
        
        emit BatchRecalled(_batchId, msg.sender, block.timestamp);
    }
    
    function recordExpiredScan(string memory _batchId) external override {
        require(batchExists[_batchId] && block.timestamp > batches[_batchId].expiryDate, "Batch not found or not expired");
        
        batches[_batchId].expiredScanCount++;
        totalExpiredScans++;
        
        if (!isExpiredBatchTracked[_batchId]) {
            expiredBatchIds.push(_batchId);
            isExpiredBatchTracked[_batchId] = true;
        }
        
        emit ExpiredBatchScanned(_batchId, msg.sender, batches[_batchId].expiredScanCount, block.timestamp);
    }
    
    function updateBatchStatus(string memory _batchId, bool _isActive) external onlyVerifiedManufacturer batchOwner(_batchId) {
        require(batchExists[_batchId] && !batches[_batchId].isRecalled, "Batch not found or recalled");
        batches[_batchId].isActive = _isActive;
    }
    
    function verifyBatch(string memory _batchId) external view override returns (MedicineBatch memory) {
        require(batchExists[_batchId], "Batch not found");
        return batches[_batchId];
    }
    
    function verifyBatchWithLog(string memory _batchId) external returns (MedicineBatch memory) {
        if (!batchExists[_batchId]) {
            emit FakeBatchDetected(_batchId, msg.sender, block.timestamp);
            revert("Batch not found");
        }
        
        emit BatchVerified(_batchId, msg.sender, block.timestamp);
        return batches[_batchId];
    }
    
    function isBatchExpired(string memory _batchId) external view returns (bool) {
        require(batchExists[_batchId], "Batch not found");
        return block.timestamp > batches[_batchId].expiryDate;
    }
    
    function isBatchValid(string memory _batchId) external view returns (bool) {
        if (!batchExists[_batchId]) return false;
        
        MedicineBatch memory batch = batches[_batchId];
        return batch.isActive && 
               !batch.isRecalled && 
               block.timestamp <= batch.expiryDate &&
               manufacturers[batch.manufacturer].isActive &&
               manufacturers[batch.manufacturer].isVerified;
    }
    
    function getManufacturer(address _manufacturer) external view returns (Manufacturer memory) {
        require(isManufacturer[_manufacturer], "Manufacturer not registered");
        return manufacturers[_manufacturer];
    }
    
    function getManufacturerBatches(address _manufacturer) external view returns (string[] memory) {
        require(isManufacturer[_manufacturer], "Manufacturer not registered");
        return manufacturerBatches[_manufacturer];
    }
    
    function getBatchesByManufacturer(address _manufacturer) external view returns (MedicineBatch[] memory) {
        require(isManufacturer[_manufacturer], "Manufacturer not registered");
        
        string[] memory batchIds = manufacturerBatches[_manufacturer];
        MedicineBatch[] memory manufacturerBatchList = new MedicineBatch[](batchIds.length);
        
        for (uint256 i = 0; i < batchIds.length; i++) {
            manufacturerBatchList[i] = batches[batchIds[i]];
        }
        
        return manufacturerBatchList;
    }
    
    function getExpiredMedicineReports() external view override returns (ExpiredMedicineReport[] memory) {
        ExpiredMedicineReport[] memory reports = new ExpiredMedicineReport[](expiredBatchIds.length);
        
        for (uint256 i = 0; i < expiredBatchIds.length; i++) {
            string memory batchId = expiredBatchIds[i];
            MedicineBatch memory batch = batches[batchId];
            
            reports[i] = ExpiredMedicineReport({
                batchId: batchId,
                medicineName: batch.medicineName,
                manufacturer: batch.manufacturer,
                expiredScanCount: batch.expiredScanCount,
                lastScannedAt: block.timestamp
            });
        }
        
        return reports;
    }
    
    function getContractStats() external view returns (uint256 _totalBatches, uint256 _totalManufacturers, uint256 _totalRecalledBatches, uint256 _totalExpiredScans, address _admin) {
        return (totalBatches, totalManufacturers, totalRecalledBatches, totalExpiredScans, admin);
    }
    
    function emergencyRecallBatch(string memory _batchId) external onlyAdmin {
        require(batchExists[_batchId] && !batches[_batchId].isRecalled, "Batch not found or already recalled");
        
        batches[_batchId].isRecalled = true;
        batches[_batchId].isActive = false;
        totalRecalledBatches++;
        
        emit BatchRecalled(_batchId, admin, block.timestamp);
    }
    
    function emergencyPause() external onlyAdmin {
        // reserved for pause logic if needed
    }
    
    function _isValidEmail(string memory _email) internal pure returns (bool) {
        bytes memory emailBytes = bytes(_email);
        if (emailBytes.length < 5 || emailBytes.length > 254) return false;
        
        bool hasAtSymbol = false;
        bool hasDotAfterAt = false;
        uint256 atPosition = 0;
        
        for (uint256 i = 0; i < emailBytes.length; i++) {
            bytes1 char = emailBytes[i];
            
            if (char == 0x40) { // '@'
                if (hasAtSymbol || i == 0 || i == emailBytes.length - 1) return false;
                hasAtSymbol = true;
                atPosition = i;
            } else if (char == 0x2E && hasAtSymbol && i > atPosition && i < emailBytes.length - 1) { // '.'
                hasDotAfterAt = true;
            } else if (char < 0x20 || char > 0x7E) {
                return false;
            }
        }
        
        return hasAtSymbol && hasDotAfterAt;
    }
}
