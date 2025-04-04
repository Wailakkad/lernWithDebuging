import mongoose, { Schema, Document } from "mongoose";

interface IErrorAnalysis {
    description?: string;
    solutionSteps?: string[];
}

interface IExerciseRequest {
    count: number;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface ISubmission extends Document {
    userId: string ; // Changed from ObjectId to String
    originalCode: string;
    errorType: string;
    language: string;
    correctedCode?: string;
    errorAnalysis?: IErrorAnalysis;
    exerciseRequest: IExerciseRequest;
    createdAt: Date;
    updatedAt: Date;
}

const ErrorAnalysisSchema = new Schema<IErrorAnalysis>({
    description: { type: String },
    solutionSteps: { type: [String] },
});

const ExerciseRequestSchema = new Schema<IExerciseRequest>({
    count: { type: Number, required: true, min: 1 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
});

const SubmissionSchema = new Schema<ISubmission>({
    userId: { type: String, required: true },
    originalCode: { type: String, required: true },
    errorType: { type: String, required: true },
    language: { type: String, required: true },
    correctedCode: { type: String },
    errorAnalysis: { type: ErrorAnalysisSchema },
    exerciseRequest: { type: ExerciseRequestSchema, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const SubmissionModel = mongoose.model<ISubmission>('Submission', SubmissionSchema);
export default SubmissionModel;