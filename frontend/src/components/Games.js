import React, { useEffect, useState } from "react";
import { fetchGames } from "../api";

const Games = () => {
    const [games, setGames] = useState([]);

    useEffect(() => {
        const getGames = async () => {
            try {
                console.log("Fetching games...");
                const response = await fetchGames();

                // Ensure the response data is an array
                if (Array.isArray(response.data)) {
                    setGames(response.data);
                } else {
                    console.error("Unexpected response format:", response);
                }
            } catch (error) {
                console.error("Error fetching games:", error);
            }
        };
        getGames();
    }, []);

    if (!games.length) {
        return <p>No games found.</p>;
    }

    return (
        <div>
            <h2>Games</h2>
            <ul>
                {games.map((game) => (
                    <li key={game.id}>
                        {game.name} - {game.moves.length} moves
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Games;
