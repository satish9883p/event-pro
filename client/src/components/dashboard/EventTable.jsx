import React from 'react';
import { motion } from 'framer-motion';
import { formatDate, formatTime } from '../../utils/helpers';

export const EventTable = ({ events, onEdit, onDelete, onStatusChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-x-auto"
    >
      <table className="w-full text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Title</th>
            <th className="px-4 py-3 text-left font-semibold">Date</th>
            <th className="px-4 py-3 text-left font-semibold">Category</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-gray-700">
          {events.map((event) => (
            <tr key={event._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                {event.title}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {formatDate(event.date)}
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {event.category}
                </span>
              </td>
              <td className="px-4 py-3">
                <select
                  value={event.status}
                  onChange={(e) => onStatusChange(event._id, e.target.value)}
                  className={`px-2 py-1 rounded text-xs font-semibold border-0 cursor-pointer ${
                    event.status === 'Published' ? 'bg-green-100 text-green-800' :
                    event.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td className="px-4 py-3 flex gap-2">
                <button
                  onClick={() => onEdit(event._id)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(event._id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};
