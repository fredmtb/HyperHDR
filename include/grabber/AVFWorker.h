#pragma once

// stl includes
#include <vector>
#include <map>

// Qt includes
#include <QObject>
#include <QSocketNotifier>
#include <QRectF>
#include <QMap>
#include <QMultiMap>
#include <QThread>
#include <QSemaphore>

// util includes
#include <utils/PixelFormat.h>
#include <hyperhdrbase/Grabber.h>
#include <utils/Components.h>


// TurboJPEG decoder
#include <QImage>
#include <QColor>


/// AVF worker for AVF devices
class AVFWorkerManager;
class AVFWorker : public  QThread
{
	Q_OBJECT	
	friend class AVFWorkerManager;
	
	public:	
		void setup(
				unsigned int _workerIndex, 
				PixelFormat __pixelFormat,
				uint8_t * _sharedData, int __size,int __width, int __height, int __lineLength,
				int		  __subsamp, 
				unsigned  __cropLeft, unsigned  __cropTop, 
				unsigned  __cropBottom, unsigned __cropRight,int __currentFrame, quint64 __frameBegin,
				int __hdrToneMappingEnabled, unsigned char* _lutBuffer, bool __qframe);
		void startOnThisThread();
		void run();
		
		bool isBusy();
		void noBusy();
		
		AVFWorker();
		~AVFWorker();	
	signals:
	    	void newFrame(unsigned int workerIndex, const Image<ColorRgb>& data, unsigned int sourceCount, quint64 _frameBegin);	
	    	void newFrameError(unsigned int workerIndex, QString,unsigned int sourceCount);   
	    					
	private:
		void runMe();
		
		
	static	volatile bool	_isActive;
	volatile bool		_isBusy;
	QSemaphore			_semaphore;
	unsigned int 		_workerIndex;				
	PixelFormat			_pixelFormat;		
	uint8_t*			_localData;
	int 				_localDataSize;
	int					_size;
	int					_width;
	int					_height;
	int					_lineLength;
	int					_subsamp;
	unsigned			_cropLeft;
	unsigned			_cropTop;
	unsigned			_cropBottom;
	unsigned			_cropRight;
	int					_currentFrame;
	uint64_t			_frameBegin;
	uint8_t				_hdrToneMappingEnabled;
	unsigned char*		_lutBuffer;
	bool				_qframe;
};

class AVFWorkerManager : public  QObject
{
	Q_OBJECT

public:
	AVFWorkerManager();
	~AVFWorkerManager();
	
	bool isActive();
	void InitWorkers();
	void Stop();
	void Start();
	
	// MT workers
	unsigned int	workersCount;
	AVFWorker**		workers;
};
