import mongoose, { Document, Schema, Types } from 'mongoose';

// Define interface for the Solution subdocument
interface ISolution extends Document {
  code: string;
}

// Define interface for each Exercise item
interface IExerciseItem extends Document {
  description: string;
  solution: ISolution;
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: string;
  status?: 'pending' | 'completed'
}

// Define main Exercise document interface
interface IExercise extends Document {
  userId: Types.ObjectId;
  exercises: IExerciseItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Solution sub-schema
const SolutionSchema = new Schema<ISolution>({
  code: { 
    type: String, 
    required: [true, 'Solution code is required'],
    trim: true
  }
});

// Exercise item sub-schema
const ExerciseItemSchema = new Schema<IExerciseItem>({
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true 
  },
  solution: { 
    type: SolutionSchema, 
    required: [true, 'Solution is required'] 
  },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  language: {
    type: String,
    trim: true
  },
  status : {
    type: String,
    enum: ['in progress', 'completed'],
    default: 'in progress'
  }
});

// Main Exercise schema
const ExerciseSchema = new Schema<IExercise>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  exercises: [ExerciseItemSchema]
}, { 
  timestamps: true 
});

// Create and export the model
const Exercise = mongoose.model<IExercise>('Exercise', ExerciseSchema);
export default Exercise;