// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/// @title ProfileRegistry
/// @notice Minimal on-chain registry for ENS-style profile cards.
contract ProfileRegistry {
    struct Profile {
        string handle;
        string displayName;
        string bio;
        string avatarUrl;
        string website;
        string twitter;
        string telegram;
        uint64 updatedAt;
    }

    /// @dev Hash(handle) => owner address. Used to keep handles unique.
    mapping(bytes32 => address) private _handleOwners;
    mapping(address => Profile) private _profiles;

    event ProfileUpserted(
        address indexed owner,
        string handle,
        string displayName,
        string bio,
        string avatarUrl,
        string website,
        string twitter,
        string telegram,
        uint64 updatedAt
    );

    /// @notice Returns the profile stored for `owner`.
    function getProfile(address owner) external view returns (Profile memory) {
        return _profiles[owner];
    }

    /// @notice Returns the current owner of `handle` if any.
    function handleOwner(string calldata handle) external view returns (address) {
        return _handleOwners[_handleHash(handle)];
    }

    /// @notice Creates or updates the caller's profile.
    /// @param profile The new profile data.
    function upsertProfile(Profile calldata profile) external {
        require(bytes(profile.handle).length >= 3, "HANDLE_TOO_SHORT");
        require(bytes(profile.handle).length <= 32, "HANDLE_TOO_LONG");

        bytes32 newHandleHash = _handleHash(profile.handle);
        address currentOwner = _handleOwners[newHandleHash];
        require(
            currentOwner == address(0) || currentOwner == msg.sender,
            "HANDLE_TAKEN"
        );

        Profile storage stored = _profiles[msg.sender];

        if (bytes(stored.handle).length != 0) {
            bytes32 previousHandleHash = _handleHash(stored.handle);
            if (previousHandleHash != newHandleHash) {
                _handleOwners[previousHandleHash] = address(0);
            }
        }

        _handleOwners[newHandleHash] = msg.sender;

        Profile memory updated = Profile({
            handle: profile.handle,
            displayName: profile.displayName,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            website: profile.website,
            twitter: profile.twitter,
            telegram: profile.telegram,
            updatedAt: uint64(block.timestamp)
        });

        _profiles[msg.sender] = updated;
        emit ProfileUpserted(
            msg.sender,
            updated.handle,
            updated.displayName,
            updated.bio,
            updated.avatarUrl,
            updated.website,
            updated.twitter,
            updated.telegram,
            updated.updatedAt
        );
    }

    function _handleHash(string memory handle) private pure returns (bytes32) {
        return keccak256(bytes(_toLower(handle)));
    }

    function _toLower(string memory input) private pure returns (string memory) {
        bytes memory bytesInput = bytes(input);
        for (uint256 i = 0; i < bytesInput.length; i++) {
            bytes1 char = bytesInput[i];
            if (char >= 0x41 && char <= 0x5A) {
                bytesInput[i] = bytes1(uint8(char) + 32);
            }
        }
        return string(bytesInput);
    }
}
