export default function Leaderboard({ users }) {
  // Sort users by score in descending order
  const sortedUsers = [...users].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-white mb-4">Leaderboard</h2>
      <ul className="w-full">
        {sortedUsers.map((user, index) => (
          <li
            key={user.name}
            className={`flex justify-between items-center p-2 rounded-lg mb-2 
            ${
              index === 0
                ? "bg-yellow-400 text-black"
                : "bg-gray-800 text-white"
            }`}
          >
            <span className="font-bold">
              {index + 1}. {user.name}
            </span>
            <span className="font-mono">{user.score} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
