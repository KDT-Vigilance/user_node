import mongoose from "mongoose";

// MongoDB 연결
const mongoURI =
  "mongodb+srv://twitter:vigilance@asg5450.o3ywm.mongodb.net/?retryWrites=true&w=majority&appName=asg5450"; // 필요에 따라 변경
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Report 모델 정의
const ReportSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video_url: { type: String, unique: true, required: true },
    cam_name: { type: String, required: true },
    status: { type: Number, required: true },
    tel: { type: String, required: true },
  },
  {
    versionKey: false, // `_v` 필드 비활성화
    timestamps: true, // `createdAt`, `updatedAt` 자동 추가
  }
);

const Report = mongoose.model("Report", ReportSchema);

// 모든 Report 문서 삭제 함수
const deleteAllReports = async () => {
  try {
    const result = await Report.deleteMany({});
    console.log(`삭제된 Report 문서 수: ${result.deletedCount}`);
  } catch (error) {
    console.error("삭제 중 오류 발생:", error);
  } finally {
    mongoose.connection.close();
  }
};

// 실행
deleteAllReports();