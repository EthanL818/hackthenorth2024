export default function Leaderboard({ users, category }) {
  // Sort users by score in descending order
  const sortedUsers = [...users].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-customBlue rounded-xl shadow-xl max-w-md mx-auto">
      <h2 className="text-2xl font-extrabold text-white mb-6 tracking-wide uppercase">
        {category}
      </h2>
      <ul className="w-full space-y-4">
        {sortedUsers.map((user, index) => (
          <li
            key={user.name}
            className={`flex justify-between items-center p-4 rounded-3xl transition-all duration-300 transform hover:scale-105
            ${
              index === 0
                ? "bg-yellow-400 text-black shadow-md"
                : index === 1
                ? "bg-gray-400 text-black shadow-md"
                : index === 2
                ? "bg-orange-400 text-black shadow-md"
                : "bg-gray-800 text-white shadow-sm"
            }`}
          >
            <span className="font-semibold text-md mr-2">
              {index + 1}. {user.name}
            </span>
            <span className="flex items-center">
              <span className="font-mono mr-2 text-sm">{user.score} pts</span>
              <span
                className={`w-3 h-3 rounded-full ${
                  user.isAvailable ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
