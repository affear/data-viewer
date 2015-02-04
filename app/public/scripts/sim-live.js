document.querySelector('#live-template').addEventListener('template-bound', function() {

    // HTML Elements
    var template = document.querySelector('#live-template');
    var sim_live = document.querySelector('#sim-live');
    var no_running_msg = document.querySelector('#no-running-msg');
    var paper_spinner = document.querySelector('#loader');

    // Firebase root references
    var bifrost = new Firebase('https://bifrost.firebaseio.com');
    var running_ref = bifrost.child('running');
    var last_sim_id_ref = bifrost.child('last_sim_id');
    var sims_ref = bifrost.child('sims');

    // Template data-binding
    template.proxies = [];
    template.stats = [];
    template.infos = [];
    template.architectures = [];
    template.progress = {
        current: 0,
        max: 100
    }

    // Chart configurations
    Chart.defaults.global.animationSteps = 20;
    Chart.defaults.global.responsive = true;
    Chart.defaults.global.maintainAspectRatio = true;
    Chart.defaults.global.scaleFontFamily = '"RobotoDraft", sans-serif';

    // FIREBASE: Get running value changes to start sim visualization
    running_ref.on('value', function(data) {

        var running = data.val();

        if (running) {
            console.log('Simulation is running');
            _showRunningSim();
        } else {
            console.log('No simulation is running');
            // Show no running sim message
            paper_spinner.style.display = 'none'
            sim_live.style.display = 'none';
            no_running_msg.style.display = 'flex';
        }
    });


    var _showRunningSim = function() {

        // FIREBASE: get last_sim_id value once
        last_sim_id_ref.once('value', function(data) {

            var last_sim_id = data.val();

            var last_sim_ref = bifrost.child('sims/' + last_sim_id);
            var last_sim_proxies_ref = last_sim_ref.child('proxies');

            // FIREBASE: get added proxy values
            last_sim_proxies_ref.on('child_added', function(data) {

                // Show sim
                paper_spinner.style.display = 'none'
                sim_live.style.display = 'flex';
                no_running_msg.style.display = 'none';

                var new_proxy = {
                    id: data.key(),
                    val: data.val()
                }
                template.proxies.push(new_proxy);

                _update_infos(last_sim_ref, new_proxy);

                initLineCharts();

                // This is shit: check when the template renders the chart
                var checkExist = setTimeout(function() {
                    var new_proxy_line_chart = document.querySelector('#line-chart' + new_proxy.id);
                    var new_proxy_bar_chart = document.querySelector('#bar-chart' + new_proxy.id);

                    if (new_proxy_line_chart && new_proxy_bar_chart) {
                        initBarCharts(new_proxy.val.architecture);
                        initDropDown();
                        _update_chart(new_proxy_line_chart, new_proxy_bar_chart);
                        console.log(last_sim_proxies_ref);
                        _update_stats(last_sim_proxies_ref, new_proxy);
                        clearInterval(checkExist);
                    }
                }, 100);

            });
        });
    }


    // Helper functions

    /*
    Updates the infos card
    */
    function _update_infos(last_sim_ref, proxy) {

        template.infos = [{
            label: 'Create',
            val: 0,
            icon: 'add-circle-outline'
        }, {
            label: 'Destroy',
            val: 0,
            icon: 'remove-circle-outline'
        }, {
            label: 'Resize',
            val: 0,
            icon: 'aspect-ratio'
        }, {
            label: 'Steps',
            val: 0,
            icon: 'more-horiz'
        }, {
            label: 'Start time',
            val: 0,
            icon: 'device:access-time'
        }, {
            label: 'Avg active cmps',
            val: 0,
            icon: 'dns'
        }, {
            label: 'Avg disk (GB)',
            val: 0,
            icon: 'device:data-usage'
        }, {
            label: 'Avg memory (MB)',
            val: 0,
            icon: 'hardware:memory'
        }, {
            label: 'Avg vcpus',
            val: 0,
            icon: 'hardware:memory'
        }, {
            label: 'Failures',
            val: 0,
            icon: 'error'
        }];

        var no_create_ref = last_sim_ref.child('no_create');
        var no_destroy_ref = last_sim_ref.child('no_destroy');
        var no_resize_ref = last_sim_ref.child('no_resize');
        var no_steps_ref = last_sim_ref.child('steps');
        var start_ref = last_sim_ref.child('start');

        var proxy_ref = last_sim_ref.child('proxies/' + proxy.id);
        var aggr_no_active_cmps_ref = proxy_ref.child('aggr_no_active_cmps');
        var aggr_r_local_gb_ref = proxy_ref.child('aggr_r_local_gb');
        var aggr_r_memory_mb_ref = proxy_ref.child('aggr_r_memory_mb');
        var aggr_r_vcpus_ref = proxy_ref.child('aggr_r_vcpus');
        var no_failures_ref = proxy_ref.child('no_failures_ref');

        no_create_ref.on('value', function(data) {
            template.infos[0].val = data.val();
            incr_progress();
        });
        no_destroy_ref.on('value', function(data) {
            template.infos[1].val = data.val();
            incr_progress();
        });
        no_resize_ref.on('value', function(data) {
            template.infos[2].val = data.val();
            incr_progress();
        });
        no_steps_ref.on('value', function(data) {
            template.infos[3].val = data.val();
            template.progress.max = data.val();
        });
        start_ref.on('value', function(data) {
            var start_date = new Date(data.val())
            var seconds = start_date.getSeconds();
            var minutes = start_date.getMinutes();
            var hour = start_date.getHours();
            var year = start_date.getFullYear();
            var month = start_date.getMonth() + 1; // Months start with 0
            var day = start_date.getDate();
            template.infos[4].val = day + "-" + month + "-" + year + " " + hour + ":" + minutes + ":" + seconds;
        });
        aggr_no_active_cmps_ref.on('value', function(data) {
            template.infos[5].val = parseFloat(data.val()).toFixed(3);
        })
        aggr_r_local_gb_ref.on('value', function(data) {
            template.infos[6].val = parseFloat(data.val() * 100).toFixed(3);
        })
        aggr_r_memory_mb_ref.on('value', function(data) {
            template.infos[7].val = parseFloat(data.val() * 100).toFixed(3);
        })
        aggr_r_vcpus_ref.on('value', function(data) {
            template.infos[8].val = parseFloat(data.val() * 100).toFixed(3);
        })
        no_failures_ref.on('value', function(data) {
            template.infos[9].val = data.val() * 100;
        })


        var incr_progress = function() {
            template.progress.current = template.infos[0].val + template.infos[1].val + template.infos[2].val;
        }
    }

    // SNAPSHOTS
    function _update_chart(line_chart, bar_chart) {
        // Updating Sanpshots
        var snapshot_count = 0;
        new_proxy_snapshots_ref = last_sim_proxies_ref.child(new_proxy.id + '/snapshots');
        new_proxy_snapshots_ref.once('value', function(data) {
            // Start reading steps the last minus 10
            var no_runned_steps = data.numChildren();
            new_proxy_snapshots_ref.orderByKey().startAt((no_runned_steps - 10).toString()).on('child_added', function(data) {
                var new_snapshot = {
                    id: data.key(),
                    val: data.val()
                }

                var new_proxy_line_chart = line_chart;
                var new_proxy_bar_chart = bar_chart;
                var command = new_snapshot.val.command;

                // LINE CHART
                // Get data
                var avg_r_local_gb = new_snapshot.val.avg_r_local_gb * 100;
                var avg_r_memory_mb = new_snapshot.val.avg_r_memory_mb * 100;
                var avg_r_vcpus = new_snapshot.val.avg_r_vcpus * 100;
                var no_active_cmps = new_snapshot.val.no_active_cmps;


                // Add to the chart
                new_proxy_line_chart.addData([avg_r_local_gb, avg_r_memory_mb, avg_r_vcpus, no_active_cmps], new_snapshot.id + ': ' + new_snapshot.val.command);

                // BAR CHART
                var cmps = new_snapshot.val.cmps;
                var new_data = [
                    []
                ];
                for (var i = 0; i < cmps.length; i++) {
                    new_data[0].push(cmps[i].r_memory_mb * 100);
                };
                new_proxy_bar_chart.update(new_data);
            });
        })
    }


    /*
    Sets the dataset configurations for the line chart with data-binding
    */
    var initLineCharts = function() {
        template.lineChartInitData = {
            datasets: [{
                label: "avg_r_local_gb",
                fillColor: "rgba(244, 67, 54, 0.2)",
                strokeColor: "rgba(244, 67, 54, 1)",
                pointColor: "rgba(244, 67, 54, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(244, 67, 54, 1)",
            }, {
                label: "avg_r_memory_mb",
                fillColor: "rgba(62, 83, 175, 0.2)",
                strokeColor: "rgba(62, 83, 175, 1)",
                pointColor: "rgba(62, 83, 175, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(62, 83, 175, 1)",
            }, {
                label: "avg_r_vcpus",
                fillColor: "rgba(65, 174, 93, 0.2)",
                strokeColor: "rgba(65, 174, 93, 1)",
                pointColor: "rgba(65, 174, 93, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(65, 174, 93, 1)",
            }, {
                label: "cmps",
                fillColor: "rgba(255, 191, 66, 0.2)",
                strokeColor: "rgba(255, 191, 66, 1)",
                pointColor: "rgba(255, 191, 66, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(255, 191, 66, 1)",
            }, ]
        };
    }

    var initBarCharts = function(architecture) {
        template.no_cmps = architecture.length;
        template.barChartInitData = {};
        template.barChartInitData.labels = [];

        var default_data = []
        for (var i = 0; i < architecture.length; i++) {
            template.barChartInitData.labels.push(architecture[i].hostname);
            default_data.push(0);
        }
        template.barChartInitData.datasets = [{
            data: default_data,
            label: "avg_r_local_gb",
            fillColor: "rgba(244, 67, 54, 0.2)",
            strokeColor: "rgba(244, 67, 54, 1)",
            pointColor: "rgba(244, 67, 54, 1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(244, 67, 54, 1)",
        }];
    }

    var initDropDown = function() {
        document.querySelector('#metric-sel').addEventListener('core-select', function(event) {
            console.log(event.detail);
        });
    }

    template.metrics = {
        selected: 'r_vcpus',
        options: [{
            name: 'Cpu',
            id: 'r_vcpus'
        }, {
            name: 'RAM',
            id: 'r_memory_mb'
        }, {
            name: 'Disk',
            id: 'r_local_gb'
        }]
    }
});
