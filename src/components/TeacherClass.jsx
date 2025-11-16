import React , {useState , useEffect} from 'react'
import './TeacherClass.css'
import { useAuth } from '../contexts/AuthContext'


const TeacherClass = () => {
  const { getAllClasses, user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadClasses = async () => {
      try {
        setLoading(true);
        setError(null);

        const classData = await getAllClasses();
        if (!mounted) return;

        if (!classData?.success) {
          setError(classData?.error || "Failed to load classes");
          return;
        }

        let fetchedClasses = classData.classes || [];

        // ✅ Filter classes for teachers - use assignedTeacher field directly
        if (user && user.role === "teacher" && user.id) {
          const userId = String(user.id);
          
          // Filter classes where assignedTeacher matches the current user's ID
          fetchedClasses = fetchedClasses.filter((cls) => {
            // Handle populated assignedTeacher (object with _id)
            if (cls.assignedTeacher && typeof cls.assignedTeacher === 'object') {
              const teacherId = String(cls.assignedTeacher._id || cls.assignedTeacher.id || '');
              return teacherId === userId;
            }
            // Handle assignedTeacher as direct ID (string or ObjectId)
            if (cls.assignedTeacher) {
              const teacherId = String(cls.assignedTeacher);
              return teacherId === userId;
            }
            return false;
          });

          console.log('Filtered classes for teacher:', {
            userId,
            totalClasses: classData.classes?.length || 0,
            filteredClasses: fetchedClasses.length,
            classes: fetchedClasses.map(c => ({
              id: c._id,
              name: c.className || c.name,
              assignedTeacher: c.assignedTeacher
            }))
          });
        }

        if (mounted) setClasses(fetchedClasses);
      } catch (err) {
        console.error('Error loading classes:', err);
        if (mounted) setError("An error occurred while loading classes");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadClasses();

    return () => {
      mounted = false;
    };
  }, [getAllClasses, user]); 

  if (loading) return <p>Loading classes...</p>;
  if (error) return <p>Error: {error}</p>;


  return (
      <div className="class-container">
      <h2 className="class-title">Assigned Classes</h2>

      <div className="class-card">
        <table className="class-table">
          <thead>
            <tr>
              <th>Class Name</th>
              <th>Class Code</th>
              <th>Room No</th>
              <th>Academic Year</th>
              <th>Teacher</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan="5">No classes assigned.</td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls._id || cls.id} className="class-row">
                  <td data-label="ClassName">
                    {cls.name || cls.className || "N/A"}
                  </td>
                  <td data-label="Code">{cls.code || cls.classCode || "N/A"}</td>
                  <td data-label="Room">{cls.roomNumber || cls.roomNo || cls.room || "N/A"}</td>
                  <td data-label="AcademicYear">
                    {cls.academicYear || cls.year || "N/A"}
                  </td>
                  <td data-label="Teacher">
                    {cls.assignedTeacher?.name ||
                      cls.teacherName ||
                      "Unassigned"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TeacherClass
