import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const QASection = () => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState([false, false, false]);

    const toggleExpand = (index) => {
        const newExpanded = [...expanded];
        newExpanded[index] = !newExpanded[index];
        setExpanded(newExpanded);
    };

    return (
        <div className="qa-section">
            <h2 className="text-2xl font-bold mb-6">{t('qa.title')}</h2>
            <div className="space-y-6">
                {t('qa.questions', { returnObjects: true }).map((question, index) => (
                    <div key={`qa-${question.title}`} className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-3">{question.title}</h3>
                        <div className="relative">
                            <p className={`text-gray-600 ${!expanded[index] ? 'line-clamp-3' : ''}`}>
                                {question.content}
                            </p>
                            <button
                                type="button"
                                onClick={() => toggleExpand(index)}
                                className="text-blue-600 hover:text-blue-800 mt-2 focus:outline-none"
                            >
                                {expanded[index] ? t('qa.readLess') : t('qa.readMore')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <style jsx>{`
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default QASection; 