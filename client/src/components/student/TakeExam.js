import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaClock, FaQuestion, FaCheck, FaTimes } from 'react-icons/fa';

const TakeExam = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [examData, setExamData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
        const fetchExamData = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`/api/results/exam/${examId}/start`);
                const { exam, questions } = response.data;

                setExamData(exam);
                setQuestions(questions);

                // Set initial time (in seconds)
                const totalTime = exam.duration * 60;
                setTimeLeft(totalTime);
                setTimerActive(true);

                // Initialize answers object
                const initialAnswers = {};
                questions.forEach((q, index) => {
                    initialAnswers[q.id] = null;
                });
                setAnswers(initialAnswers);
            } catch (error) {
                console.error('Error fetching exam data:', error);
                toast.error('Failed to load exam data');
                navigate('/student/exams');
            } finally {
                setIsLoading(false);
            }
        };

        fetchExamData();
    }, [examId, navigate]);

    const handleSubmitExam = useCallback(async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            // Prepare answers data
            const answersData = Object.keys(answers).map(questionId => ({
                questionId: parseInt(questionId),
                selectedOption: answers[questionId]
            }));

            // Calculate time taken (initial time - remaining time)
            const initialTime = (examData?.duration || 0) * 60;
            const timeTaken = Math.max(0, initialTime - timeLeft);

            await axios.post(`/api/results/exam/${examId}/submit`, {
                answers: answersData,
                timeTaken
            });

            toast.success('Exam submitted successfully!');
            navigate('/student/results');
        } catch (error) {
            console.error('Error submitting exam:', error);
            const message = error.response?.data?.message || 'Failed to submit exam';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
            setTimerActive(false);
        }
    }, [answers, examData, examId, isSubmitting, navigate, timeLeft]);

    useEffect(() => {
        if (timerActive && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && timerActive) {
            // Time's up - auto-submit
            handleSubmitExam();
        }
    }, [timeLeft, timerActive, handleSubmitExam]);


    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (questionId, selectedOption) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    const goToQuestion = (index) => {
        if (index >= 0 && index < questions.length) {
            setCurrentQuestionIndex(index);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };


    const getQuestionStatus = (questionId) => {
        if (answers[questionId] === null) {
            return 'unanswered';
        } else {
            return 'answered';
        }
    };

    if (isLoading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <span>Loading exam...</span>
            </div>
        );
    }

    if (!examData || questions.length === 0) {
        return (
            <div className="error">
                <p>No exam data available</p>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const questionStatus = getQuestionStatus(currentQuestion.id);
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="take-exam">
            <div className="exam-header">
                <h1>{examData?.name || examData?.title || 'Exam'}</h1>
                <div className="exam-info">
                    <div className="time-left">
                        <FaClock /> {formatTime(timeLeft)}
                    </div>
                    <div className="question-count">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </div>
                </div>
            </div>

            <div className="exam-progress">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="question-container">
                <div className="question-header">
                    <h2>Question {currentQuestionIndex + 1}</h2>
                    <div className="question-status">
                        <span className={`status ${questionStatus}`}>
                            {questionStatus === 'answered' ? (
                                <><FaCheck /> Answered</>
                            ) : (
                                <><FaTimes /> Unanswered</>
                            )}
                        </span>
                    </div>
                </div>

                <div className="question-text">
                    <FaQuestion /> {currentQuestion.questionText}
                </div>

                <div className="options-container">
                    {['A', 'B', 'C', 'D'].map((option) => (
                        <div
                            key={option}
                            className={`option ${answers[currentQuestion.id] === option ? 'selected' : ''}`}
                            onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                        >
                            <span className="option-letter">{option}.</span>
                            <span className="option-text">{currentQuestion[`option${option}`]}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="exam-navigation">
                <button
                    className="btn btn-secondary"
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                >
                    Previous
                </button>

                <div className="question-navigation">
                    {questions.map((_, index) => (
                        <button
                            key={index}
                            className={`question-nav-btn ${index === currentQuestionIndex ? 'active' : ''} ${getQuestionStatus(questions[index].id) === 'answered' ? 'answered' : ''}`}
                            onClick={() => goToQuestion(index)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>

                {currentQuestionIndex < questions.length - 1 ? (
                    <button
                        className="btn btn-primary"
                        onClick={nextQuestion}
                    >
                        Next
                    </button>
                ) : (
                    <button
                        className="btn btn-success"
                        onClick={handleSubmitExam}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TakeExam;