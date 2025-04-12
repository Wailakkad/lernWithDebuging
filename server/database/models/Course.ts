import mongoose, { Document, Schema, Types } from 'mongoose';

interface ICourstem extends Document {
  title: string;
  content: string;
}

const CoureItemSchema = new Schema<ICourstem>({
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
});

interface ICourse extends Document {
  userId: Types.ObjectId;
  language: string;
  courses: Types.DocumentArray<ICourstem>;
}

const CourseSchema = new Schema<ICourse>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
  },
  courses: {
    type: [CoureItemSchema],
    required: [true, 'Courses are required'],
  },
});

const Course = mongoose.model<ICourse>('Course', CourseSchema);

export default Course;