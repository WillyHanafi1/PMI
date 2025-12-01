import React from 'react';
import { Team, COMPETITIONS, PaymentStatus } from '@/types';
import { Users, CheckCircle, Clock, XCircle, Trash2, Edit } from 'lucide-react';

interface TeamCardProps {
    team: Team;
    onDelete?: (teamId: string) => void;
    onEdit?: (team: Team) => void;
    showActions?: boolean;
}

export const TeamCard: React.FC<TeamCardProps> = ({
    team,
    onDelete,
    onEdit,
    showActions = true
}) => {
    const competition = COMPETITIONS.find(c => c.type === team.competitionType);

    const getStatusBadge = () => {
        switch (team.paymentStatus) {
            case PaymentStatus.PAID:
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        <CheckCircle size={14} className="mr-1" />
                        Lunas
                    </span>
                );
            case PaymentStatus.PENDING:
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        <Clock size={14} className="mr-1" />
                        Pending
                    </span>
                );
            case PaymentStatus.FAILED:
            case PaymentStatus.EXPIRED:
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        <XCircle size={14} className="mr-1" />
                        Gagal
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{team.teamName}</h3>
                    <p className="text-sm text-gray-600">{competition?.name}</p>
                </div>
                {getStatusBadge()}
            </div>

            <div className="mb-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Users size={16} className="mr-2" />
                    <span className="font-semibold">{team.members.length} Anggota:</span>
                </div>
                <ul className="space-y-1 ml-6">
                    {team.members.map((member, index) => (
                        <li key={index} className="text-sm text-gray-700">
                            {index + 1}. {member.name} <span className="text-gray-500">({member.kelas})</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-lg font-bold text-primary-600">
                    Rp {team.price.toLocaleString('id-ID')}
                </span>

                {showActions && team.paymentStatus === PaymentStatus.PENDING && (
                    <div className="flex space-x-2">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(team)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Tim"
                            >
                                <Edit size={18} />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(team.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Tim"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
