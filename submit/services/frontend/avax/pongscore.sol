// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

contract pongscore {
    struct ScoreEntry {
        uint8 rank;
        string pname;
        uint8 score;
    }

    struct Tournament {
        uint256 tournamentID;
        ScoreEntry[] scores;
    }

    mapping(uint256 => Tournament) public tournaments;

    event TournamentCreated(uint256 indexed tournamentID, address indexed sender);
    event ScoreSubmitted(uint256 indexed tournamentID, uint8 rank, string pname, uint8 score, address indexed sender);

    function submitScores(uint256 tournamentID, uint8[] memory ranks, string[] memory pnames, uint8[] memory scores) external {
        require(pnames.length == scores.length && scores.length == ranks.length, "Mismatch in pnames and scores length");
        require(pnames.length == 4 || pnames.length == 8, "Only 4 or 8 players allowed");

        Tournament storage tournament = tournaments[tournamentID];
        tournament.tournamentID = tournamentID;

        for (uint256 i = 0; i < pnames.length; i++) {
            tournament.scores.push(ScoreEntry(ranks[i], pnames[i], scores[i]));
            emit ScoreSubmitted(tournamentID, ranks[i], pnames[i], scores[i], msg.sender);
        }

        emit TournamentCreated(tournamentID, msg.sender);
    }

    function getScores(uint256 tournamentID) external view returns (uint8[] memory, string[] memory, uint8[] memory) {
        uint256 length = tournaments[tournamentID].scores.length;
        uint8[] memory ranks = new uint8[](length);
        string[] memory pnames = new string[](length);
        uint8[] memory scores = new uint8[](length);

        for (uint256 i = 0; i < length; i++) {
            ranks[i] = tournaments[tournamentID].scores[i].rank;
            pnames[i] = tournaments[tournamentID].scores[i].pname;
            scores[i] = tournaments[tournamentID].scores[i].score;
        }

        return (ranks, pnames, scores);
    }
}