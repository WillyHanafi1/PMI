import React from 'react';
import { CompetitionType, COMPETITIONS } from '@/types';
import { Trophy, Users, DollarSign } from 'lucide-react';

interface CompetitionCardProps {
    competitionType: CompetitionType;
    onRegister: (type: CompetitionType) => void;
}

export const CompetitionCard: React.FC<CompetitionCardProps> = ({
    competitionType,
    onRegister
}) => {
    const competition = COMPETITIONS.find(c => c.type === competitionType);

    if (!competition) return null;

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex items-center justify-between">
                    <Trophy size={32} className="opacity-90" />
                    <span className="text-2xl font-bold opacity-90">
                        {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                        }).format(competition.price)}
                    </span>
                </div>
                <h3 className="text-xl font-bold mt-4">{competition.name}</h3>
            </div>

            {/* Content */}
            <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">
                    {competition.description}
                </p>

                <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                            <Users size={16} className="mr-2" />
                            Anggota
                        </span>
                        <span className="font-semibold text-gray-900">
                            {competition.minMembers} - {competition.maxMembers} orang
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                            <DollarSign size={16} className="mr-2" />
                            Harga
                        </span>
                        <span className="font-semibold text-primary-600">
                            Rp {competition.price.toLocaleString('id-ID')} / tim
                        </span>
                    </div>
                </div>

                {/* Register Button */}
                <button
                    onClick={() => onRegister(competitionType)}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 group-hover:shadow-lg"
                >
                    Daftar Tim
                </button>
            </div>
        </div>
    );
};
