import React from 'react';
import './GanttChart.css';

const GanttChart = ({ tasks , open}) => {
  console.log(tasks)
  // 全タスクの開始日と終了日から日付範囲を取得
  const getAllDates = () => {
    const dates = tasks.flatMap(task => [new Date(task.data.start), new Date(task.data.end)]);
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    const dateArray = [];
    const currentDate = new Date(minDate);
    
    while (currentDate <= maxDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dateArray;
  };

  const dates = getAllDates();

  // 指定した日付がタスクの期間内かチェック
  const isDateInTask = (date, task) => {
    const checkDate = new Date(date);
    const startDate = new Date(task.data.start);
    const endDate = new Date(task.data.end);
    
    return checkDate >= startDate && checkDate <= endDate;
  };

  // 日付をフォーマット
  const formatDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const formatDateMonth = (date) => {
    const month = date.getMonth() + 1;
    return `${month}`;
  };  
  const formatDateDay = (date) => {
    const day = date.getDate();
    return `${day}`;
  };  

  return (
    <div className="gantt-chart-container pb-8">
      {/* <h2>ガントチャート</h2> */}
      <table className="gantt-chart">
        <thead>
          <tr>
            <th className="task-name-header border"> </th>
            {dates.map((date, index) => (
              <th key={index} className="date-header bg-green-100 border p-0.5">
                {formatDateMonth(date)}<br />{formatDateDay(date)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="task-name border p-0.5">{task.data.title}</td>
              {dates.map((date, index) => (
                <td
                  key={index}
                  className={isDateInTask(date, task) ? 'task-active' : 'task-inactive'}
                  onClick={()=>{
                    const v = isDateInTask(date, task);
                    console.log("v=" ,v)
                    if(v){ open(task) }
                  }}
                
                >
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GanttChart;
/*
const testData = [
  {
    id: 1, 
    title: 'Task 1-test, 123456790-ABCDEFGHIJKLMN', 
    start: '2023-09-16',
    end: '2023-10-20',
  },
  {
    id: 2, 
    title: 'Task 2', 
    start: '2023-10-15',
    end: '2023-10-25',
  },
  {
    id: 3, 
    title: 'Task 3', 
    start: '2023-10-20',
    end: '2023-12-30',
  },  
];
*/
